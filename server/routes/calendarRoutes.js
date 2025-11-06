import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Reminder from "../models/Reminder.js";
import {
  getAuthUrl,
  makeOAuthClient,
  setCredentialsAndGetCalendar,
} from "../utils/googleAuth.js";

const router = express.Router();
const TZ = process.env.APP_TIMEZONE || "Asia/Ho_Chi_Minh";

/** Middleware auth của bạn (JWT Bearer) */
const authMiddleware = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer "))
    return res.status(401).json({ message: "Không có token!" });
  try {
    const token = h.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
    req.user = { id: decoded.id };
    next();
  } catch (e) {
    return res.status(401).json({ message: "Token không hợp lệ!" });
  }
};

/** 1) Bắt đầu connect Google → redirect sang consent screen */
router.get("/connect", async (req, res) => {
  res.redirect(getAuthUrl());
});

/** 2) Google redirect về đây sau khi user đồng ý */
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    const oauth2 = makeOAuthClient();
    const { tokens } = await oauth2.getToken(code);

    // Ở đây bạn cần biết user nào vừa connect.
    // Cách đơn giản: trước khi redirect đi, bạn lưu một state (JWT của app) vào session / cookie.
    // Để demo nhanh, mình giả sử client đã gọi /connect sau khi login
    // và client đang mở cùng trình duyệt nên bạn có thể trả về tokens và client POST tiếp cho user hiện tại.
    // Cách đẹp hơn: dùng "state" trong OAuth URL để kèm JWT → validate tại đây.

    // Trả tạm tokens về (Frontend sẽ POST /api/calendar/save-token)
    return res.status(200).send(`
      <html>
        <body>
          <script>
            window.opener && window.opener.postMessage(${JSON.stringify(
              tokens
            )}, "*");
            window.close();
          </script>
          <p>Đã liên kết Google. Bạn có thể đóng tab này.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("OAuth callback lỗi");
  }
});

/** 3) Lưu token Google vào user */
router.post("/save-token", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    user.google = req.body; // { access_token, refresh_token, scope, token_type, expiry_date }
    await user.save();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/** 4) Tạo event (1 lần hoặc lặp hàng tháng) + lưu Reminder */
router.post("/reminders", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      dueAt,
      durationMin = 30,
      recurrence = "NONE",
      amount,
      billType,
    } = req.body;
    const user = await User.findById(req.user.id);
    if (!user?.google)
      return res
        .status(400)
        .json({ message: "User chưa liên kết Google Calendar" });

    const calendar = setCredentialsAndGetCalendar(user.google);

    const startDate = new Date(dueAt);
    const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);

    const eventResource = {
      summary: title,
      description,
      start: { dateTime: startDate.toISOString(), timeZone: TZ },
      end: { dateTime: endDate.toISOString(), timeZone: TZ },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 60 }, // nhắc 1h trước
          { method: "email", minutes: 24 * 60 }, // email 1 ngày trước
        ],
      },
    };

    if (recurrence === "MONTHLY") {
      eventResource.recurrence = ["RRULE:FREQ=MONTHLY"];
    }

    const { data: event } = await calendar.events.insert({
      calendarId: "primary",
      resource: eventResource,
    });

    const reminder = await Reminder.create({
      userId: user._id,
      title,
      description,
      dueAt: startDate,
      durationMin,
      recurrence,
      amount,
      billType,
      calendarEventId: event.id,
    });

    res.json({ success: true, event, reminder });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
});

/** 5) Sửa event & reminder */
router.put("/reminders/:id", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      dueAt,
      durationMin,
      recurrence,
      amount,
      billType,
    } = req.body;
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!reminder)
      return res.status(404).json({ message: "Không tìm thấy reminder" });

    const user = await User.findById(req.user.id);
    if (!user?.google)
      return res
        .status(400)
        .json({ message: "User chưa liên kết Google Calendar" });

    const calendar = setCredentialsAndGetCalendar(user.google);

    const startDate = dueAt ? new Date(dueAt) : new Date(reminder.dueAt);
    const endDate = new Date(
      startDate.getTime() + (durationMin ?? reminder.durationMin) * 60 * 1000
    );

    const resource = {
      summary: title ?? reminder.title,
      description: description ?? reminder.description,
      start: { dateTime: startDate.toISOString(), timeZone: TZ },
      end: { dateTime: endDate.toISOString(), timeZone: TZ },
    };

    if ((recurrence ?? reminder.recurrence) === "MONTHLY") {
      resource.recurrence = ["RRULE:FREQ=MONTHLY"];
    } else {
      resource.recurrence = null; // xóa lặp nếu chuyển sang NONE
    }

    const { data: event } = await calendar.events.update({
      calendarId: "primary",
      eventId: reminder.calendarEventId,
      resource,
    });

    reminder.title = resource.summary;
    reminder.description = resource.description;
    reminder.dueAt = startDate;
    reminder.durationMin = durationMin ?? reminder.durationMin;
    reminder.recurrence = recurrence ?? reminder.recurrence;
    reminder.amount = amount ?? reminder.amount;
    reminder.billType = billType ?? reminder.billType;
    await reminder.save();

    res.json({ success: true, event, reminder });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/** 6) Xóa event & reminder */
router.delete("/reminders/:id", authMiddleware, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!reminder)
      return res.status(404).json({ message: "Không tìm thấy reminder" });

    const user = await User.findById(req.user.id);
    if (!user?.google)
      return res
        .status(400)
        .json({ message: "User chưa liên kết Google Calendar" });

    const calendar = setCredentialsAndGetCalendar(user.google);

    if (reminder.calendarEventId) {
      await calendar.events.delete({
        calendarId: "primary",
        eventId: reminder.calendarEventId,
      });
    }
    await reminder.deleteOne();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

/** 7) List reminders (Mongo) */
router.get("/reminders", authMiddleware, async (req, res) => {
  const items = await Reminder.find({ userId: req.user.id }).sort({ dueAt: 1 });
  res.json(items);
});

export default router;
