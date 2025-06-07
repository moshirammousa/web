const express = require("express");
const fs = require("fs");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // مهم جدًا علشان يعرض ملفات الـ HTML



// ✅ nodemailer setup
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "109f67526da0b7", // ← بيانات Mailtrap بتاعتك
    pass: "5c7c80eeaaadbe"
  }
});

// ✅ حفظ بيانات العميل
app.post("/api/customer", (req, res) => {
  const file = "customers.json";

  fs.readFile(file, "utf8", (err, content) => {
    let customers = [];
    if (!err && content) customers = JSON.parse(content);

    const data = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    customers.push(data);
    fs.writeFile(file, JSON.stringify(customers, null, 2), () => {
      const mailOptions = {
        from: "no-reply@accompany.test",
        to: "admin@accompany.com",
        subject: "🚨 عميل جديد تم تسجيله",
         text: `
👤 الاسم: ${data.name}
📦 نوع الطلب: ${data.type}
📝 الرسالة: ${data.message}
🕓 وقت التسجيل: ${data.createdAt}
`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("❌ فشل إرسال الإيميل:", error);
        } else {
          console.log("📧 تم إرسال الإيميل بنجاح:", info.response);
        }
      });

      res.json({ message: "✅ تم حفظ بيانات العميل" });
    });
  });
});

// ✅ حفظ بيانات الفني
app.post("/api/technician", (req, res) => {
  const file = "technicians.json";

  fs.readFile(file, "utf8", (err, content) => {
    let technicians = [];
    if (!err && content) technicians = JSON.parse(content);

    const data = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    technicians.push(data);
    fs.writeFile(file, JSON.stringify(technicians, null, 2), () => {
      res.json({ message: "✅ تم حفظ بيانات الفني" });
    });
  });
});

       
     
/* ---------------- 📊 APIs للوحة التحكم ---------------- */

// عدد العملاء الكلي
app.get("/api/customers/count", (req, res) => {
  fs.readFile("customers.json", "utf8", (err, content) => {
    if (err || !content) return res.json({ count: 0 });
    const customers = JSON.parse(content);
    res.json({ count: customers.length });
  });
});

// عدد العملاء في تاريخ معين
app.get("/api/customers/by-date/:date", (req, res) => {
  const requestedDate = req.params.date;
  fs.readFile("customers.json", "utf8", (err, content) => {
    if (err || !content) return res.json({ count: 0 });
    const customers = JSON.parse(content);
    const filtered = customers.filter(c =>
      new Date(c.createdAt).toISOString().split("T")[0] === requestedDate
    );
    res.json({ date: requestedDate, count: filtered.length });
  });
});

// إحصائيات الأعطال مقابل الشراء
app.get("/api/customers/stats", (req, res) => {
  fs.readFile("customers.json", "utf8", (err, content) => {
    if (err || !content) return res.json({ error: "No data" });
    const customers = JSON.parse(content);
    let repair = 0, buy = 0;
    customers.forEach(c => {
      if (c.type === "عطل") repair++;
      if (c.type === "شراء") buy++;
    });
    res.json({ عطل: repair, شراء: buy });
  });
});

// أعلى فني اشتغل
app.get("/api/technician/top", (req, res) => {
  fs.readFile("technicians.json", "utf8", (err, content) => {
    if (err || !content) return res.json({ error: "No data" });
    const technicians = JSON.parse(content);
    const counts = {};
    technicians.forEach(t => {
      if (t.techName) counts[t.techName] = (counts[t.techName] || 0) + 1;
    });
    const topTech = Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
    res.json({ topTechnician: topTech, count: counts[topTech] });
  });
});

// عدد تسجيلات الفنيين في تاريخ معين
app.get("/api/technicians/by-date/:date", (req, res) => {
  const requestedDate = req.params.date;
  fs.readFile("technicians.json", "utf8", (err, content) => {
    if (err || !content) return res.json({ error: "No data" });
    const data = JSON.parse(content);
    const result = {};
    data.forEach(t => {
      const dateOnly = new Date(t.createdAt).toISOString().split("T")[0];
      if (dateOnly === requestedDate) {
        result[t.techName] = (result[t.techName] || 0) + 1;
      }
    });
    res.json({ date: requestedDate, technicians: result });
  });
});

// تشغيل السيرفر
app.listen(3000, () => {
  console.log("🚀 السيرفر شغال على http://localhost:3000");
});
