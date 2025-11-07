-- Script tạo bảng notifications cho SQL Server
-- Chạy script này trong SQL Server Management Studio hoặc Azure Data Studio

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[notifications] (
        [id] INT IDENTITY(1,1) PRIMARY KEY,
        [user_id] VARCHAR(26) NOT NULL, -- ID của người nhận thông báo
        [actor_id] VARCHAR(26) NULL, -- ID của người thực hiện hành động (người follow, like, etc.)
        [post_id] INT NULL, -- ID của bài viết (nếu thông báo liên quan đến post)
        [notification_type] VARCHAR(50) NOT NULL, -- Loại thông báo: 'follow', 'like', 'comment', 'account_locked', etc.
        [message] NVARCHAR(500) NULL, -- Nội dung thông báo
        [is_read] BIT NOT NULL DEFAULT 0, -- Đã đọc chưa (0 = chưa đọc, 1 = đã đọc)
        [created_at] DATETIME NOT NULL DEFAULT GETDATE(), -- Thời gian tạo
        
        -- Foreign keys
        CONSTRAINT [FK_notifications_user_id] FOREIGN KEY ([user_id]) 
            REFERENCES [Users]([User_id]) ON DELETE CASCADE,
        CONSTRAINT [FK_notifications_actor_id] FOREIGN KEY ([actor_id]) 
            REFERENCES [Users]([User_id]) ON DELETE SET NULL,
        
        -- Indexes để tối ưu truy vấn
        INDEX [IX_notifications_user_id] ([user_id]),
        INDEX [IX_notifications_created_at] ([created_at]),
        INDEX [IX_notifications_is_read] ([is_read])
    );
    
    PRINT 'Bảng notifications đã được tạo thành công!';
END
ELSE
BEGIN
    PRINT 'Bảng notifications đã tồn tại.';
END
GO

