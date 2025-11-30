import * as SQLite from 'expo-sqlite';

// --- Type Definitions ---
// Defines the structure of a Post object in your app
export interface Post {
    id?: number; // Optional because it's auto-incremented by the DB
    username: string;
    title: string;
    summary?: string;
    media_url?: string;
    tags: string[];
}

// --- Additional Domain Types ---
export interface UserProfile {
  id?: number;
  username: string; // unique
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}

export interface CommentItem {
  id?: number;
  post_id: number;
  user_id: number;
  content: string;
  created_at?: string;
}

export interface LikeItem {
  id?: number;
  post_id: number;
  user_id: number;
  created_at?: string;
}

export interface CommentLikeItem {
  id?: number;
  comment_id: number;
  user_id: number;
  created_at?: string;
}

export interface MediaItem {
  id?: number;
  post_id: number;
  type: 'image' | 'video' | 'audio' | 'file';
  uri: string;
  metadata?: Record<string, any>;
}

export interface ShareItem {
  id?: number;
  post_id: number;
  user_id: number;
  target?: string; // e.g., "system-share|copy-link|dm|external-app"
  created_at?: string;
}

// Open a database, creating it if it doesn't exist
// ✅ This is the single, correct declaration
// Create a small compatibility shim so existing tx.executeSql code keeps working
const dbRaw: any = (SQLite as any).openDatabase?.('main.db') || (SQLite as any).openDatabaseSync?.('main.db');

const db: any = {
  transaction(cb: (tx: any) => void) {
    const tx = {
      executeSql(sql: string, params: any[] = [], success?: any, error?: any) {
        (async () => {
          try {
            const isSelect = /^\s*select/i.test(sql);
            if (isSelect && dbRaw?.getAllAsync) {
              const rows = await dbRaw.getAllAsync(sql, params);
              success && success(null, { rows: { _array: rows } });
              return;
            }
            if (dbRaw?.runAsync) {
              await dbRaw.runAsync(sql, params);
              success && success();
              return;
            }
            if (dbRaw?.execAsync) {
              await dbRaw.execAsync([{ sql, args: params }]);
              success && success();
              return;
            }
            throw new Error('No supported SQLite async methods found');
          } catch (e) {
            error && error(null, e);
          }
        })();
      },
    };
    cb(tx);
  },
};

/**
 * Sets up the database tables if they don't already exist.
 * Call this once when your app starts.
 */
const setupDatabase = (): void => {
  db.transaction((tx: any) => {
    // Core posts table (kept as-is for backward compatibility with current UI)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        username TEXT NOT NULL, 
        title TEXT NOT NULL, 
        summary TEXT, 
        media_url TEXT, 
        tags TEXT
      );`
    );
    // Users
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        display_name TEXT,
        avatar_url TEXT,
        bio TEXT
      );`
    );

    // Comments
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now'))
      );`
    );

    // Likes (unique per user per post)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE (post_id, user_id)
      );`
    );

    // Comment Likes (unique per user per comment)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS comment_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        comment_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE (comment_id, user_id)
      );`
    );

    // Media attachments (for multiple assets per post)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        uri TEXT NOT NULL,
        metadata TEXT
      );`
    );

    // Shares (basic audit of share actions)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS shares (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        target TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );`
    );

    // Helpful indexes
    tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);`);
    tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);`);
    tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);`);
    tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_media_post ON media(post_id);`);
    tx.executeSql(`CREATE INDEX IF NOT EXISTS idx_shares_post ON shares(post_id);`);

    console.log("Database tables checked/created!");
  });
};

/**
 * Adds a new post to the database.
 * @param {Post} post - The post object to add.
 */
const addPost = (post: Omit<Post, 'id'>): void => {
  const tagsString = JSON.stringify(post.tags || []);
  db.transaction((tx: any) => {
    tx.executeSql(
      'INSERT INTO posts (username, title, summary, tags, media_url) VALUES (?, ?, ?, ?, ?)',
      [post.username, post.title, post.summary, tagsString, post.media_url],
      () => console.log('Post added successfully:', post.title),
      (_: any, error: any) => {
          console.log('Error adding post:', error);
          return false; // Transaction failed
        }
    );
  });
};

/**
 * Fetches all posts from the database.
 * @param {function} setPosts - The React state setter function to update posts.
 */
const getPosts = (setPosts: React.Dispatch<React.SetStateAction<Post[]>>): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'SELECT * FROM posts ORDER BY id DESC', // Get newest posts first
      [],
      (_: any, result: any) => {
        const array = (result?.rows?._array) || [];
        const postsWithTags = (array as any[]).map((p): Post => ({
            ...p,
            tags: JSON.parse(p.tags || '[]')
        }));
        setPosts(postsWithTags);
      },
       (_: any, error: any) => {
          console.log('Error fetching posts:', error);
          return false; // Transaction failed
        }
    );
  });
};

// --- Users ---
const upsertUser = (user: Omit<UserProfile, 'id'>): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      `INSERT INTO users (username, display_name, avatar_url, bio)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(username) DO UPDATE SET
         display_name=excluded.display_name,
         avatar_url=excluded.avatar_url,
         bio=excluded.bio;`,
      [user.username, user.display_name || null, user.avatar_url || null, user.bio || null],
      () => console.log('User upserted:', user.username),
      (_: any, error: any) => { console.log('Error upserting user:', error); return false; }
    );
  });
};

const getUserByUsername = (
  username: string,
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>
): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'SELECT * FROM users WHERE username = ? LIMIT 1',
      [username],
      (_: any, result: any) => {
        const array = (result?.rows?._array) || [];
        setUser((array as any[])[0] || null);
      },
      (_: any, error: any) => { console.log('Error fetching user:', error); return false; }
    );
  });
};

// Get or create a user and return the full row (including id)
const getOrCreateUser = (
  username: string,
  displayName: string | undefined,
  cb: (user: UserProfile) => void
): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      `INSERT INTO users (username, display_name) VALUES (?, ?)
       ON CONFLICT(username) DO NOTHING;`,
      [username, displayName || null],
      () => {
        tx.executeSql(
          'SELECT * FROM users WHERE username = ? LIMIT 1',
          [username],
          (_: any, result: any) => {
            const row = (result?.rows?._array?.[0]) || null;
            if (row) cb(row as UserProfile);
          },
          (_: any, error: any) => { console.log('Error selecting user:', error); return false; }
        );
      },
      (_: any, error: any) => { console.log('Error inserting/selecting user:', error); return false; }
    );
  });
};

// --- Comments ---
const addComment = (comment: Omit<CommentItem, 'id' | 'created_at'>): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [comment.post_id, comment.user_id, comment.content],
      () => console.log('Comment added for post:', comment.post_id),
      (_: any, error: any) => { console.log('Error adding comment:', error); return false; }
    );
  });
};

const getCommentsForPost = (
  postId: number,
  setComments: React.Dispatch<React.SetStateAction<CommentItem[]>>
): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'SELECT * FROM comments WHERE post_id = ? ORDER BY id ASC',
      [postId],
      (_: any, result: any) => {
        const array = (result?.rows?._array) || [];
        setComments((array as any[]) as CommentItem[]);
      },
      (_: any, error: any) => { console.log('Error fetching comments:', error); return false; }
    );
  });
};

// --- Likes ---
const addLike = (postId: number, userId: number): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'INSERT OR IGNORE INTO likes (post_id, user_id) VALUES (?, ?)',
      [postId, userId],
      () => console.log('Like added for post:', postId),
      (_: any, error: any) => { console.log('Error adding like:', error); return false; }
    );
  });
};

const removeLike = (postId: number, userId: number): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'DELETE FROM likes WHERE post_id = ? AND user_id = ?',
      [postId, userId],
      () => console.log('Like removed for post:', postId),
      (_: any, error: any) => { console.log('Error removing like:', error); return false; }
    );
  });
};

const getLikeCount = (
  postId: number,
  setCount: React.Dispatch<React.SetStateAction<number>>
): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
      [postId],
      (_: any, result: any) => {
        const array = (result?.rows?._array) || [];
        const row = (array as any[])[0];
        setCount((row && (row as any).count) ? Number((row as any).count) : 0);
      },
      (_: any, error: any) => { console.log('Error counting likes:', error); return false; }
    );
  });
};

const hasUserLiked = (
  postId: number,
  userId: number,
  setLiked: React.Dispatch<React.SetStateAction<boolean>>
): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'SELECT 1 FROM likes WHERE post_id = ? AND user_id = ? LIMIT 1',
      [postId, userId],
      (_: any, result: any) => {
        setLiked(!!(result?.rows && result.rows.length > 0));
      },
      (_: any, error: any) => { console.log('Error checking like:', error); return false; }
    );
  });
};

// --- Media ---
const addMedia = (media: Omit<MediaItem, 'id'>): void => {
  const metadata = JSON.stringify(media.metadata || {});
  db.transaction((tx: any) => {
    tx.executeSql(
      'INSERT INTO media (post_id, type, uri, metadata) VALUES (?, ?, ?, ?)',
      [media.post_id, media.type, media.uri, metadata],
      () => console.log('Media added for post:', media.post_id),
      (_: any, error: any) => { console.log('Error adding media:', error); return false; }
    );
  });
};

const getMediaForPost = (
  postId: number,
  setMedia: React.Dispatch<React.SetStateAction<MediaItem[]>>
): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'SELECT * FROM media WHERE post_id = ? ORDER BY id ASC',
      [postId],
      (_: any, result: any) => {
        const array = (result?.rows?._array) || [];
        const items = (array as any[]).map((m): MediaItem => ({
          ...(m as any),
          metadata: (() => { try { return JSON.parse((m as any).metadata || '{}'); } catch { return {}; } })()
        }));
        setMedia(items);
      },
      (_: any, error: any) => { console.log('Error fetching media:', error); return false; }
    );
  });
};

// --- Shares ---
const addShare = (share: Omit<ShareItem, 'id' | 'created_at'>): void => {
  db.transaction((tx: any) => {
    tx.executeSql(
      'INSERT INTO shares (post_id, user_id, target) VALUES (?, ?, ?)',
      [share.post_id, share.user_id, share.target || null],
      () => console.log('Share recorded for post:', share.post_id),
      (_: any, error: any) => { console.log('Error recording share:', error); return false; }
    );
  });
};

export const DatabaseService = {
  setupDatabase,
  addPost,
  getPosts,
  // users
  upsertUser,
  getUserByUsername,
  getOrCreateUser,
  // comments
  addComment,
  getCommentsForPost,
  // likes
  addLike,
  removeLike,
  getLikeCount,
  hasUserLiked,
  // comment likes
  addCommentLike(commentId: number, userId: number): void {
    db.transaction((tx: any) => {
      tx.executeSql(
        'INSERT OR IGNORE INTO comment_likes (comment_id, user_id) VALUES (?, ?)',
        [commentId, userId],
        () => console.log('Comment like added:', commentId),
        (_: any, error: any) => { console.log('Error adding comment like:', error); return false; }
      );
    });
  },
  removeCommentLike(commentId: number, userId: number): void {
    db.transaction((tx: any) => {
      tx.executeSql(
        'DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?',
        [commentId, userId],
        () => console.log('Comment like removed:', commentId),
        (_: any, error: any) => { console.log('Error removing comment like:', error); return false; }
      );
    });
  },
  getCommentLikeCount(commentId: number, setCount: React.Dispatch<React.SetStateAction<number>>): void {
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT COUNT(*) as count FROM comment_likes WHERE comment_id = ?',
        [commentId],
        (_: any, result: any) => {
          const row = result?.rows?._array?.[0];
          setCount(row ? Number(row.count) : 0);
        },
        (_: any, error: any) => { console.log('Error counting comment likes:', error); return false; }
      );
    });
  },
  hasUserLikedComment(commentId: number, userId: number, setLiked: React.Dispatch<React.SetStateAction<boolean>>): void {
    db.transaction((tx: any) => {
      tx.executeSql(
        'SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ? LIMIT 1',
        [commentId, userId],
        (_: any, result: any) => {
          setLiked(!!(result?.rows && result.rows.length > 0));
        },
        (_: any, error: any) => { console.log('Error checking comment like:', error); return false; }
      );
    });
  },
  // media
  addMedia,
  getMediaForPost,
  // shares
  addShare,
};