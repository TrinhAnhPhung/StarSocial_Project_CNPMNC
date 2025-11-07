import React, { useEffect, useMemo, useState } from "react";
import "../Styles/base.css";
import "../Styles/layout.css";
import "../Styles/components/notification.css";
import { API_BASE } from "../../../constants/api";

const ago = ({ days = 0, hours = 0, minutes = 0 } = {}) => {
  const d = new Date();
  if (minutes) d.setMinutes(d.getMinutes() - minutes);
  if (hours) d.setHours(d.getHours() - hours);
  if (days) d.setDate(d.getDate() - days);
  return d;
};

const isSameDay = (a, b) => a.toDateString() === b.toDateString();

const groupNotifications = (items) => {
  const today = new Date();
  const yesterday = ago({ days: 1 });
  return items.reduce(
    (acc, n) => {
      const d = n.timestamp;
      if (isSameDay(d, today)) acc.Newest.push(n);
      else if (isSameDay(d, yesterday)) acc.Yesterday.push(n);
      else acc.Earlier.push(n);
      return acc;
    },
    { Newest: [], Yesterday: [], Earlier: [] }
  );
};

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const token = localStorage.getItem("token");
  const userId = user?.id;

  useEffect(() => {
    const load = async () => {
      if (!userId || !token) {
        setErr("Chưa đăng nhập.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/notifications?userId=${userId}`, {
          headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const normalized = data.map((n) => {
          const rawMsg = n.message || "";
          const match = rawMsg.match(/\[[^\]]*\]\s*(.*)/);
          const cleanMsg =
            match && match[1] ? match[1].trim() : rawMsg.replace(/\[[^\]]*\]/g, "").trim();

          let title = "Thông báo hệ thống";
          if (/account_unlocked/i.test(rawMsg)) title = "Tài khoản đã được mở khóa";
          else if (/account_locked/i.test(rawMsg)) title = "Tài khoản bị khóa";
          else if (n.notification_type === "violation_marked") title = "Đánh dấu vi phạm";

          return {
            id: n.id,
            message: title,
            details: cleanMsg || "(Không có nội dung chi tiết)",
            timestamp: new Date(n.created_at),
            isRead: !!n.is_read,
            actorUsername: n.actor_username || "",
            actorAvatar: n.actor_avatar || "",
            postId: n.post_id || null,
            rawType: n.notification_type,
          };
        });

        setNotifications(normalized);
        setErr("");
      } catch (e) {
        console.error(e);
        setErr(e.message || "Không thể tải thông báo");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, token]);

  const handleNotificationClick = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const grouped = useMemo(() => groupNotifications(notifications), [notifications]);
  const ORDER = ["Newest", "Yesterday", "Earlier"];

  return (
    <div className="page page--center">
      <div className="panel panel--narrow">
        {loading ? (
          <h2 className="notif-group-title">Đang tải...</h2>
        ) : err ? (
          <div className="notif-card">
            <div className="notif-item is-unread">
              <div className="notif-item__texts">
                <p className="notif-item__message">{err}</p>
                <p className="notif-item__time">{new Date().toLocaleString("vi-VN")}</p>
              </div>
            </div>
          </div>
        ) : (
          ORDER.map(
            (groupName) =>
              grouped[groupName].length > 0 && (
                <div key={groupName}>
                  <h2 className="notif-group-title">{groupName}</h2>
                  <div className="stack stack--sm">
                    {grouped[groupName].map((n) => {
                      const isOpen = expandedId === n.id;
                      return (
                        <div key={n.id} className="notif-card">
                          <div
                            className={`notif-item ${n.isRead ? "is-read" : "is-unread"} ${
                              isOpen ? "is-open" : ""
                            }`}
                            onClick={() => handleNotificationClick(n.id)}
                          >
                            <img
                              className="notif-item__avatar"
                              src={n.actorAvatar}
                              alt=""
                              onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
                            />
                            <div className="notif-item__texts">
                              <p className="notif-item__message">{n.message}</p>
                              <p className="notif-item__time">
                                {n.timestamp.toLocaleString("vi-VN")}
                              </p>
                            </div>
                            <span className="material-icons icon--chevron">expand_more</span>
                          </div>

                          {isOpen && (
                            <div className="collapse open">
                              <div className="collapse__body">
                                <p>{n.details}</p>
                                {n.actorUsername && (
                                  <p className="notif-meta">
                                    Người xử lý: <strong>@{n.actorUsername}</strong>
                                  </p>
                                )}
                                {n.postId && (
                                  <p className="notif-meta">
                                    Bài viết ID: <strong>{n.postId}</strong>
                                  </p>
                                )}
                                <p className="notif-meta">Loại: {n.rawType}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
          )
        )}
      </div>
    </div>
  );
}
