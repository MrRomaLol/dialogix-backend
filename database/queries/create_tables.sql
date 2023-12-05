CREATE TABLE IF NOT EXISTS [accounts] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[username] TEXT NOT NULL UNIQUE,
[email] TEXT NOT NULL UNIQUE,
[hashed_password] BLOB NOT NULL,
[salt] BLOB NOT NULL,
[register_date] DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE IF NOT EXISTS [users] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[user_id] INTEGER NOT NULL,
[nickname] TEXT NOT NULL UNIQUE,
[avatar_url] TEXT,
[status] TEXT DEFAULT 'offline',
FOREIGN KEY([user_id]) REFERENCES [accounts]([id]));

CREATE TABLE IF NOT EXISTS [friends] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[user_id1] INTEGER NOT NULL,
[user_id2] INTEGER NOT NULL,
[status] TEXT NOT NULL DEFAULT pending,
[created_at] DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY([user_id1]) REFERENCES [accounts]([id]),
FOREIGN KEY([user_id2]) REFERENCES [accounts]([id]));

CREATE TABLE IF NOT EXISTS [messages] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[sender_id] INTEGER NOT NULL,
[receiver_id] INTEGER NOT NULL,
[content] TEXT,
[files] TEXT,
[time_stamp] DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY([sender_id]) REFERENCES [accounts]([id]),
FOREIGN KEY([receiver_id]) REFERENCES [accounts]([id]));

CREATE TABLE IF NOT EXISTS [guilds] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[creator_id] INTEGER NOT NULL,
[name] TEXT NOT NULL,
[avatar_url] TEXT,
[created_at] DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY([creator_id]) REFERENCES [accounts]([id]));

CREATE TABLE IF NOT EXISTS [guild_channels] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[guild_id] INTEGER NOT NULL,
[category_id] INTEGER,
[name] TEXT NOT NULL,
[channel_type] TEXT NOT NULL,
FOREIGN KEY([guild_id]) REFERENCES [guilds]([id]),
FOREIGN KEY([category_id]) REFERENCES [guild_channels_category]([id]));

CREATE TABLE IF NOT EXISTS [guild_channels_category] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[guild_id] INTEGER NOT NULL,
[name] TEXT NOT NULL,
FOREIGN KEY([guild_id]) REFERENCES [guilds]([id]));

CREATE TABLE IF NOT EXISTS [guild_message] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[channel_id] INTEGER NOT NULL,
[user_id] INTEGER NOT NULL,
[content] TEXT NOT NULL,
[time_stamp] DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY([channel_id]) REFERENCES [guild_channels]([id]),
FOREIGN KEY([user_id]) REFERENCES [accounts]([id]));

CREATE TABLE IF NOT EXISTS [guild_members] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[user_id] INTEGER NOT NULL,
[guild_id] INTEGER NOT NULL,
[role] TEXT NOT NULL DEFAULT 'member',
FOREIGN KEY([user_id]) REFERENCES [accounts]([id]),
FOREIGN KEY([guild_id]) REFERENCES [guilds]([id]));

CREATE TABLE IF NOT EXISTS [guild_invites] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[invite_link] TEXT NOT NULL,
[guild_id] INTEGER NOT NULL,
[sender_id] INTEGER NOT NULL,
[invited_users] TEXT NOT NULL,
FOREIGN KEY([sender_id]) REFERENCES [accounts]([id]),
FOREIGN KEY([guild_id]) REFERENCES [guilds]([id]));

CREATE TABLE IF NOT EXISTS [feedbacks] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[created_by] INTEGER NOT NULL,
[content] TEXT NOT NULL,
[is_checked] BOOLEAN NOT NULL DEFAULT 0,
[created_at] DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY([created_by]) REFERENCES [accounts]([id]));

CREATE TABLE IF NOT EXISTS [user_settings] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[user_id] INTEGER NOT NULL,
[setting_name] TEXT NOT NULL,
[setting_value] TEXT NOT NULL,
FOREIGN KEY([user_id]) REFERENCES [accounts]([id]));

CREATE TABLE IF NOT EXISTS [guild_settings] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[guild_id] INTEGER NOT NULL,
[setting_name] TEXT NOT NULL,
[setting_value] TEXT NOT NULL,
FOREIGN KEY([guild_id]) REFERENCES [guilds]([id]));

CREATE TABLE IF NOT EXISTS [channel_settings] (
[id] INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
[channel_id] INTEGER NOT NULL,
[setting_name] TEXT NOT NULL,
[setting_value] TEXT NOT NULL,
FOREIGN KEY([channel_id]) REFERENCES [guild_channels]([id]));