import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { io } from "socket.io-client"; 
import { usePopup } from "../IsPopup"; 

import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import ChatSettingsPanel from "./ChatSettingsPanel";
import CreateGroupModal from "./CreateGroupModal";
import AddMemberModal from "./AddMemberModal";

/* ---------------------------------------------------
 * 6️⃣ LAYOUT CHÍNH (COMPONENT CHA)
 * --------------------------------------------------- */
export default function ChatModal() {
    const { user } = useOutletContext(); 
    const [activeTab, setActiveTab] = useState("all");
    const [settingsOpen, setSettingsOpen] = useState(false);
    const { setIsPopup } = usePopup();
    const [conversations, setConversations] = useState([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true); 
    const [selectedConversation, setSelectedConversation] = useState(null);
    const navigate = useNavigate();
    const linkBackend = import.meta.env.VITE_Link_backend || "http://localhost:5000";
    
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    const [participants, setParticipants] = useState([]);
    const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

    
    const socketRef = useRef(null);
    if (!socketRef.current && linkBackend) {
        const backendBaseUrl = new URL(linkBackend).origin;
        console.log("[Socket] Đang kết nối tới:", backendBaseUrl);
        socketRef.current = io(backendBaseUrl);
    }
    const socket = socketRef.current;
    
    if (!user) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
                <p className="text-2xl text-gray-500">Đang tải thông tin người dùng...</p>
            </div>
        );
    }

    // (useEffect tải danh sách chat giữ nguyên)
    useEffect(() => {
        const fetchConversations = async () => {
            setIsLoadingConversations(true); 
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/login');
                setIsLoadingConversations(false); 
                return;
            }
            const authHeaders = { 'Authorization': `Bearer ${token}` };
            try {
                const url = `${linkBackend}/api/conversations/`;
                const response = await fetch(url, { headers: authHeaders });
                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        navigate('/login');
                        throw new Error("Phiên đăng nhập hết hạn.");
                    }
                    throw new Error(`Không thể tải danh sách chat (status: ${response.status})`);
                }
                const data = await response.json();
                setConversations(data);
            } catch (err) {
                console.error("LỖI TRONG fetchConversations:", err);
            } finally {
                setIsLoadingConversations(false); 
            }
        };
        if (linkBackend && navigate) {
            fetchConversations();
        } else {
            setIsLoadingConversations(false); 
        }
    }, [linkBackend, navigate]); 
    
    // (useEffect lọc tìm kiếm giữ nguyên)
    useEffect(() => {
        const lowerCaseSearch = searchTerm.toLowerCase();
        const filtered = conversations.filter((convo) => {
            const displayName = (convo.DisplayName || convo.Conversation_Name || "Người dùng").toLowerCase();
            const lastMessage = (convo.LastMessageContent || "").toLowerCase();
            return displayName.includes(lowerCaseSearch) || lastMessage.includes(lowerCaseSearch);
        });
        setFilteredConversations(filtered);
    }, [searchTerm, conversations]);

    // (useEffect lắng nghe socket giữ nguyên)
    useEffect(() => {
        if (!socket || !user) return; 
        const handleReceiveMessage = (newMsg) => {
            setConversations((prev) =>
                prev
                    .map((c) =>
                        c.Conversation_id === newMsg.Conversation_id
                            ? {
                                ...c,
                                LastMessageContent: newMsg.Content,
                                LastMessageTime: newMsg.Sent_at, 
                                UnreadCount:
                                    c.Conversation_id !== selectedConversation?.Conversation_id &&
                                    newMsg.Sender_id !== user.id 
                                        ? (c.UnreadCount || 0) + 1
                                        : c.UnreadCount, 
                            }
                            : c
                    )
                    .sort((a, b) =>
                            new Date(b.LastMessageTime || b.Created_at) -
                            new Date(a.LastMessageTime || a.Created_at)
                    )
            );
        };
        socket.on("receive_message", handleReceiveMessage);
        return () => {
            socket.off("receive_message", handleReceiveMessage);
        };
    }, [socket, selectedConversation, user]); 

    // (useEffect tải participants giữ nguyên)
    useEffect(() => {
        if (selectedConversation && selectedConversation.Type === 'group') {
            const fetchParticipants = async () => {
                setIsLoadingParticipants(true);
                const token = localStorage.getItem("token");
                try {
                    const response = await fetch(
                        `${linkBackend}/api/conversations/${selectedConversation.Conversation_id}/participants`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    );
                    if (!response.ok) throw new Error("Lỗi tải thành viên");
                    const data = await response.json();
                    setParticipants(data);
                } catch (err) {
                    console.error("Lỗi fetchParticipants (Cha):", err);
                    setParticipants([]); 
                } finally {
                    setIsLoadingParticipants(false);
                }
            };
            fetchParticipants();
        } else {
            setParticipants([]); // Reset nếu là chat 1-1
        }
    }, [selectedConversation, linkBackend]);


    // --- HÀM CALLBACKS ---
    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setSettingsOpen(false); 
        if (conversation.UnreadCount > 0) {
            setConversations((prev) =>
                prev.map((c) =>
                    c.Conversation_id === conversation.Conversation_id
                        ? { ...c, UnreadCount: 0 }
                        : c
                )
            );
        }
    };
    
    const handleGroupCreated = (newGroup) => {
        setConversations(prev => [newGroup, ...prev]);
        setSelectedConversation(newGroup);
    };
    
    const onConversationDeleted = (conversationId) => {
        setConversations(prev => prev.filter(c => c.Conversation_id !== conversationId));
        setSelectedConversation(null);
        setSettingsOpen(false);
    };

    const onConversationUpdated = (updatedInfo) => {
        setConversations(prev => 
            prev.map(c => 
                c.Conversation_id === updatedInfo.Conversation_id 
                    ? { ...c, ...updatedInfo } 
                    : c
            )
        );
        setSelectedConversation(prev => ({ ...prev, ...updatedInfo }));
        
        if (updatedInfo._memberChange) {
            setIsLoadingParticipants(true);
            const token = localStorage.getItem("token");
            fetch(`${linkBackend}/api/conversations/${updatedInfo.Conversation_id}/participants`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => setParticipants(data))
            .catch(err => console.error("Lỗi tải lại participants:", err))
            .finally(() => setIsLoadingParticipants(false));
        }
    };

    const onMembersAdded = (newlyAddedUsers) => {
        setParticipants(prev => [...prev, ...newlyAddedUsers]);
    };
    
    useEffect(() => {
        setIsPopup(false);
        return () => setIsPopup(true);
    }, [setIsPopup]);

    return (
        <> 
            <div className="flex h-screen overflow-hidden bg-gray-50">
                <ChatSidebar
                    user={user}
                    conversations={filteredConversations} 
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    onSelectConversation={handleSelectConversation}
                    activeConversationId={selectedConversation?.Conversation_id}
                    isLoading={isLoadingConversations} 
                    onSelectChat={setActiveTab}
                    activeTab={activeTab}
                    onOpenCreateGroup={() => setIsCreateGroupOpen(true)}
                />
                
                <div className="flex flex-1 flex-col"> 
                    <div className="flex flex-1 overflow-hidden">
                        <ChatWindow
                            user={user}
                            selectedConversation={selectedConversation}
                            onOpenSettings={() => setSettingsOpen(!settingsOpen)} 
                            linkBackend={linkBackend}
                            navigate={navigate}
                            socket={socket} 
                        />
                        {settingsOpen && (
                            <ChatSettingsPanel 
                                chatInfo={selectedConversation} 
                                onClose={() => setSettingsOpen(false)}
                                linkBackend={linkBackend} 
                                user={user}
                                navigate={navigate}
                                onConversationDeleted={onConversationDeleted}
                                onConversationUpdated={onConversationUpdated}
                                participants={participants}
                                isLoadingParticipants={isLoadingParticipants}
                                onOpenAddMember={() => setIsAddMemberOpen(true)}
                            />
                        )}
                    </div>
                </div>
            </div>
            
            <CreateGroupModal
                isOpen={isCreateGroupOpen}
                onClose={() => setIsCreateGroupOpen(false)}
                user={user}
                linkBackend={linkBackend}
                onGroupCreated={handleGroupCreated}
            />

            <AddMemberModal
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                user={user}
                linkBackend={linkBackend}
                chatInfo={selectedConversation}
                currentParticipants={participants}
                onMembersAdded={onMembersAdded}
            />
        </>
    );
}
