export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	public: {
		Tables: {
			artworks: {
				Row: {
					ai: boolean | null;
					artwork_id: string;
					book_id: string;
					chapter_id: string | null;
					created_at: string;
					description: string | null;
					dislike_count: number;
					endorsed: boolean;
					id: number;
					like_count: number | null;
					name: string;
					statistics_modified_at: string | null;
					updated_at: string | null;
					url: string | null;
					user_id: string;
					user_modified_at: string | null;
					username: string;
				};
				Insert: {
					ai?: boolean | null;
					artwork_id: string;
					book_id: string;
					chapter_id?: string | null;
					created_at?: string;
					description?: string | null;
					dislike_count?: number;
					endorsed?: boolean;
					id?: number;
					like_count?: number | null;
					name?: string;
					statistics_modified_at?: string | null;
					updated_at?: string | null;
					url?: string | null;
					user_id: string;
					user_modified_at?: string | null;
					username?: string;
				};
				Update: {
					ai?: boolean | null;
					artwork_id?: string;
					book_id?: string;
					chapter_id?: string | null;
					created_at?: string;
					description?: string | null;
					dislike_count?: number;
					endorsed?: boolean;
					id?: number;
					like_count?: number | null;
					name?: string;
					statistics_modified_at?: string | null;
					updated_at?: string | null;
					url?: string | null;
					user_id?: string;
					user_modified_at?: string | null;
					username?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'book_id_fkey';
						columns: ['book_id'];
						isOneToOne: false;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'chapter_id_fkey';
						columns: ['chapter_id'];
						isOneToOne: false;
						referencedRelation: 'chapters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'public_artworks_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'username';
						columns: ['username'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['username'];
					}
				];
			};
			author_book_buckets: {
				Row: {
					created_at: string;
					folders: string[];
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					folders?: string[];
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					folders?: string[];
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'author_book_buckets_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: true;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			author_book_message: {
				Row: {
					book_id: string;
					created_at: string;
					message: string;
					updated_at: string;
				};
				Insert: {
					book_id: string;
					created_at?: string;
					message: string;
					updated_at?: string;
				};
				Update: {
					book_id?: string;
					created_at?: string;
					message?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'author_book_message_book_id_fkey';
						columns: ['book_id'];
						isOneToOne: true;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					}
				];
			};
			author_follower_message: {
				Row: {
					author_id: string;
					created_at: string;
					expiration_date: string;
					message: string;
					updated_at: string;
				};
				Insert: {
					author_id: string;
					created_at?: string;
					expiration_date: string;
					message: string;
					updated_at?: string;
				};
				Update: {
					author_id?: string;
					created_at?: string;
					expiration_date?: string;
					message?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'author_follower_message_author_id_fkey';
						columns: ['author_id'];
						isOneToOne: true;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					}
				];
			};
			books: {
				Row: {
					age_range: unknown | null;
					author_id: string;
					author_name: string;
					authors_words: string;
					average_rating: number | null;
					category: string;
					chapter_count: number;
					character_count: number;
					character_development_rating: number;
					cover_url: string;
					created_at: string;
					dislike_count: number;
					display_name: string | null;
					extra: Json | null;
					id: string;
					is_crawled: boolean;
					is_public_domain: boolean | null;
					is_visible: boolean;
					language: string;
					lead: string;
					level_of_immersion_rating: number;
					like_count: number;
					maturity_levels: string[] | null;
					maturity_ratings: string;
					plot_rating: number;
					price: number;
					audience: string;
					recommendation_count: number;
					review_count: number;
					sell_type: string;
					shelved_count: number;
					statistics_modified_at: string;
					status: string;
					summary: string;
					tags: string[];
					title: string;
					total_click: number;
					updated_at: string;
					user_modified_at: string;
					word_count: number | null;
					world_setting_rating: number;
					writing_rating: number;
				};
				Insert: {
					age_range?: unknown | null;
					author_id: string;
					author_name?: string;
					authors_words: string;
					average_rating?: number | null;
					category: string;
					chapter_count?: number;
					character_count?: number;
					character_development_rating?: number;
					cover_url: string;
					created_at?: string;
					dislike_count?: number;
					display_name?: string | null;
					extra?: Json | null;
					id: string;
					is_crawled?: boolean;
					is_public_domain?: boolean | null;
					is_visible?: boolean;
					language: string;
					lead: string;
					level_of_immersion_rating?: number;
					like_count?: number;
					maturity_levels?: string[] | null;
					maturity_ratings?: string;
					plot_rating?: number;
					price?: number;
					audience: string;
					recommendation_count?: number;
					review_count?: number;
					sell_type?: string;
					shelved_count?: number;
					statistics_modified_at?: string;
					status?: string;
					summary: string;
					tags: string[];
					title: string;
					total_click?: number;
					updated_at?: string;
					user_modified_at?: string;
					word_count?: number | null;
					world_setting_rating?: number;
					writing_rating?: number;
				};
				Update: {
					age_range?: unknown | null;
					author_id?: string;
					author_name?: string;
					authors_words?: string;
					average_rating?: number | null;
					category?: string;
					chapter_count?: number;
					character_count?: number;
					character_development_rating?: number;
					cover_url?: string;
					created_at?: string;
					dislike_count?: number;
					display_name?: string | null;
					extra?: Json | null;
					id?: string;
					is_crawled?: boolean;
					is_public_domain?: boolean | null;
					is_visible?: boolean;
					language?: string;
					lead?: string;
					level_of_immersion_rating?: number;
					like_count?: number;
					maturity_levels?: string[] | null;
					maturity_ratings?: string;
					plot_rating?: number;
					price?: number;
					audience?: string;
					recommendation_count?: number;
					review_count?: number;
					sell_type?: string;
					shelved_count?: number;
					statistics_modified_at?: string;
					status?: string;
					summary?: string;
					tags?: string[];
					title?: string;
					total_click?: number;
					updated_at?: string;
					user_modified_at?: string;
					word_count?: number | null;
					world_setting_rating?: number;
					writing_rating?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'books_author_name_fkey';
						columns: ['author_name'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['username'];
					}
				];
			};
			chapters: {
				Row: {
					author_id: string;
					authors_words: string;
					book_id: string;
					character_count: number;
					content: string;
					created_at: string;
					dislike_count: number;
					id: string;
					like_count: number;
					price: number;
					scheduled_publish_date: string | null;
					sequence: number;
					statistics_modified_at: string;
					status: string;
					title: string;
					updated_at: string;
					user_modified_at: string;
					word_count: number | null;
				};
				Insert: {
					author_id: string;
					authors_words?: string;
					book_id: string;
					character_count?: number;
					content?: string;
					created_at?: string;
					dislike_count?: number;
					id: string;
					like_count?: number;
					price?: number;
					scheduled_publish_date?: string | null;
					sequence: number;
					statistics_modified_at?: string;
					status?: string;
					title: string;
					updated_at?: string;
					user_modified_at?: string;
					word_count?: number | null;
				};
				Update: {
					author_id?: string;
					authors_words?: string;
					book_id?: string;
					character_count?: number;
					content?: string;
					created_at?: string;
					dislike_count?: number;
					id?: string;
					like_count?: number;
					price?: number;
					scheduled_publish_date?: string | null;
					sequence?: number;
					statistics_modified_at?: string;
					status?: string;
					title?: string;
					updated_at?: string;
					user_modified_at?: string;
					word_count?: number | null;
				};
				Relationships: [
					{
						foreignKeyName: 'book_id';
						columns: ['book_id'];
						isOneToOne: false;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					}
				];
			};
			chatrooms: {
				Row: {
					allow_join: boolean;
					created_at: string;
					description: string;
					is_archived: boolean | null;
					is_deleted: boolean | null;
					is_public: boolean | null;
					max_user: number;
					mute_all: boolean;
					mute_duration: number;
					mute_start_date: string | null;
					name: string;
					owner_id: string;
					reason: string | null;
					room_id: string;
					roomer: string[];
					secret: string | null;
					status: string | null;
					user_count: number;
				};
				Insert: {
					allow_join?: boolean;
					created_at?: string;
					description?: string;
					is_archived?: boolean | null;
					is_deleted?: boolean | null;
					is_public?: boolean | null;
					max_user?: number;
					mute_all?: boolean;
					mute_duration?: number;
					mute_start_date?: string | null;
					name: string;
					owner_id: string;
					reason?: string | null;
					room_id: string;
					roomer?: string[];
					secret?: string | null;
					status?: string | null;
					user_count?: number;
				};
				Update: {
					allow_join?: boolean;
					created_at?: string;
					description?: string;
					is_archived?: boolean | null;
					is_deleted?: boolean | null;
					is_public?: boolean | null;
					max_user?: number;
					mute_all?: boolean;
					mute_duration?: number;
					mute_start_date?: string | null;
					name?: string;
					owner_id?: string;
					reason?: string | null;
					room_id?: string;
					roomer?: string[];
					secret?: string | null;
					status?: string | null;
					user_count?: number;
				};
				Relationships: [];
			};
			comments: {
				Row: {
					avatar_url: string;
					book_id: string;
					chapter_id: string;
					content: string;
					created_at: string;
					dislike_count: number;
					has_unread_child: boolean;
					id: string;
					is_unread: boolean;
					is_visible: boolean;
					language: string;
					last_read_at: string;
					like_count: number;
					parent_id: string | null;
					section_id: string;
					statistics_modified_at: string;
					tags: string[] | null;
					updated_at: string;
					user_id: string;
					user_modified_at: string;
					username: string;
				};
				Insert: {
					avatar_url: string;
					book_id: string;
					chapter_id: string;
					content: string;
					created_at?: string;
					dislike_count?: number;
					has_unread_child?: boolean;
					id: string;
					is_unread?: boolean;
					is_visible?: boolean;
					language?: string;
					last_read_at?: string;
					like_count?: number;
					parent_id?: string | null;
					section_id: string;
					statistics_modified_at?: string;
					tags?: string[] | null;
					updated_at?: string;
					user_id: string;
					user_modified_at?: string;
					username?: string;
				};
				Update: {
					avatar_url?: string;
					book_id?: string;
					chapter_id?: string;
					content?: string;
					created_at?: string;
					dislike_count?: number;
					has_unread_child?: boolean;
					id?: string;
					is_unread?: boolean;
					is_visible?: boolean;
					language?: string;
					last_read_at?: string;
					like_count?: number;
					parent_id?: string | null;
					section_id?: string;
					statistics_modified_at?: string;
					tags?: string[] | null;
					updated_at?: string;
					user_id?: string;
					user_modified_at?: string;
					username?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'book_id_fkey';
						columns: ['book_id'];
						isOneToOne: false;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'chapter_idx_fkey';
						columns: ['chapter_id'];
						isOneToOne: false;
						referencedRelation: 'chapters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'fk_comments_username';
						columns: ['username'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['username'];
					},
					{
						foreignKeyName: 'parent_id';
						columns: ['parent_id'];
						isOneToOne: false;
						referencedRelation: 'comments';
						referencedColumns: ['id'];
					}
				];
			};
			external_profile: {
				Row: {
					cred: Json;
					external_id: string | null;
					is_linked: boolean;
					type: string;
					user_id: string;
				};
				Insert: {
					cred: Json;
					external_id?: string | null;
					is_linked: boolean;
					type: string;
					user_id: string;
				};
				Update: {
					cred?: Json;
					external_id?: string | null;
					is_linked?: boolean;
					type?: string;
					user_id?: string;
				};
				Relationships: [];
			};
			previews: {
				Row: {
					book_id: string;
					chapter_id: string;
					created_at: string;
					description: string | null;
					id: string;
					name: string | null;
					ttl: number;
					user_id: string;
					user_ids: string[];
				};
				Insert: {
					book_id: string;
					chapter_id: string;
					created_at?: string;
					description?: string | null;
					id: string;
					name?: string | null;
					ttl?: number;
					user_id: string;
					user_ids?: string[];
				};
				Update: {
					book_id?: string;
					chapter_id?: string;
					created_at?: string;
					description?: string | null;
					id?: string;
					name?: string | null;
					ttl?: number;
					user_id?: string;
					user_ids?: string[];
				};
				Relationships: [
					{
						foreignKeyName: 'book_id';
						columns: ['book_id'];
						isOneToOne: false;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'fkey_chapter_id';
						columns: ['chapter_id'];
						isOneToOne: false;
						referencedRelation: 'chapters';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'user_id';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			profiles: {
				Row: {
					about_you: string;
					avatar_url: string | null;
					birthday: string | null;
					book_visited_count: number | null;
					comment_count: number | null;
					comment_like_count: number | null;
					created_at: string;
					dislike_count: number;
					extra: Json;
					follower_count: number;
					id: string;
					industry: string;
					is_beta_reader: boolean | null;
					language: string;
					like_count: number;
					occupation: string;
					review_count: number | null;
					review_like_count: number | null;
					role: string | null;
					tags: string[] | null;
					updated_at: string;
					user_modified_at: string;
					username: string;
				};
				Insert: {
					about_you?: string;
					avatar_url?: string | null;
					birthday?: string | null;
					book_visited_count?: number | null;
					comment_count?: number | null;
					comment_like_count?: number | null;
					created_at?: string;
					dislike_count?: number;
					extra?: Json;
					follower_count?: number;
					id: string;
					industry?: string;
					is_beta_reader?: boolean | null;
					language?: string;
					like_count?: number;
					occupation?: string;
					review_count?: number | null;
					review_like_count?: number | null;
					role?: string | null;
					tags?: string[] | null;
					updated_at?: string;
					user_modified_at?: string;
					username: string;
				};
				Update: {
					about_you?: string;
					avatar_url?: string | null;
					birthday?: string | null;
					book_visited_count?: number | null;
					comment_count?: number | null;
					comment_like_count?: number | null;
					created_at?: string;
					dislike_count?: number;
					extra?: Json;
					follower_count?: number;
					id?: string;
					industry?: string;
					is_beta_reader?: boolean | null;
					language?: string;
					like_count?: number;
					occupation?: string;
					review_count?: number | null;
					review_like_count?: number | null;
					role?: string | null;
					tags?: string[] | null;
					updated_at?: string;
					user_modified_at?: string;
					username?: string;
				};
				Relationships: [];
			};
			reviews: {
				Row: {
					avatar_url: string | null;
					book_id: string;
					character_development_rating: number;
					content: string;
					created_at: string;
					dislike_count: number;
					id: string;
					is_visible: boolean;
					language: string;
					level_of_immersion_rating: number;
					like_count: number;
					plot_rating: number;
					statistics_modified_at: string;
					title: string;
					type: string | null;
					updated_at: string;
					user_id: string;
					user_modified_at: string;
					username: string;
					world_setting_rating: number;
					writing_rating: number;
				};
				Insert: {
					avatar_url?: string | null;
					book_id: string;
					character_development_rating?: number;
					content: string;
					created_at?: string;
					dislike_count?: number;
					id: string;
					is_visible?: boolean;
					language?: string;
					level_of_immersion_rating?: number;
					like_count?: number;
					plot_rating?: number;
					statistics_modified_at?: string;
					title?: string;
					type?: string | null;
					updated_at?: string;
					user_id: string;
					user_modified_at?: string;
					username?: string;
					world_setting_rating?: number;
					writing_rating?: number;
				};
				Update: {
					avatar_url?: string | null;
					book_id?: string;
					character_development_rating?: number;
					content?: string;
					created_at?: string;
					dislike_count?: number;
					id?: string;
					is_visible?: boolean;
					language?: string;
					level_of_immersion_rating?: number;
					like_count?: number;
					plot_rating?: number;
					statistics_modified_at?: string;
					title?: string;
					type?: string | null;
					updated_at?: string;
					user_id?: string;
					user_modified_at?: string;
					username?: string;
					world_setting_rating?: number;
					writing_rating?: number;
				};
				Relationships: [
					{
						foreignKeyName: 'book_id';
						columns: ['book_id'];
						isOneToOne: false;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'fk_reviews_username';
						columns: ['username'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['username'];
					}
				];
			};
			scheduled_chapter: {
				Row: {
					chapter_id: string;
					created_at: string;
					new_status: string;
					publish_date: string;
					updated_at: string;
				};
				Insert: {
					chapter_id: string;
					created_at?: string;
					new_status: string;
					publish_date: string;
					updated_at?: string;
				};
				Update: {
					chapter_id?: string;
					created_at?: string;
					new_status?: string;
					publish_date?: string;
					updated_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'scheduled_chapter_chapter_id_fkey';
						columns: ['chapter_id'];
						isOneToOne: true;
						referencedRelation: 'chapters';
						referencedColumns: ['id'];
					}
				];
			};
			user_artwork_data: {
				Row: {
					artwork_id: string;
					created_at: string;
					extra: Json | null;
					is_like: boolean | null;
					updated_at: string;
					user_id: string;
					user_modified_at: string;
				};
				Insert: {
					artwork_id: string;
					created_at?: string;
					extra?: Json | null;
					is_like?: boolean | null;
					updated_at?: string;
					user_id: string;
					user_modified_at?: string;
				};
				Update: {
					artwork_id?: string;
					created_at?: string;
					extra?: Json | null;
					is_like?: boolean | null;
					updated_at?: string;
					user_id?: string;
					user_modified_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'artwork_id_fkey';
						columns: ['artwork_id'];
						isOneToOne: false;
						referencedRelation: 'artworks';
						referencedColumns: ['artwork_id'];
					},
					{
						foreignKeyName: 'user_artwork_data_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			user_author_message_data: {
				Row: {
					created_at: string;
					message_id: string;
					read: boolean;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					message_id: string;
					read: boolean;
					user_id: string;
				};
				Update: {
					created_at?: string;
					message_id?: string;
					read?: boolean;
					user_id?: string;
				};
				Relationships: [];
			};
			user_book_data: {
				Row: {
					accepted_reader: boolean | null;
					author_folder: string;
					book_id: string;
					created_at: string;
					extra: Json | null;
					folder: string;
					is_beta_reader: boolean | null;
					is_like: boolean | null;
					is_purchased: boolean;
					is_shelved: boolean;
					last_chapter_read: string | null;
					stripe: Json;
					tags: string[] | null;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					accepted_reader?: boolean | null;
					author_folder: string;
					book_id: string;
					created_at?: string;
					extra?: Json | null;
					folder?: string;
					is_beta_reader?: boolean | null;
					is_like?: boolean | null;
					is_purchased?: boolean;
					is_shelved?: boolean;
					last_chapter_read?: string | null;
					stripe?: Json;
					tags?: string[] | null;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					accepted_reader?: boolean | null;
					author_folder?: string;
					book_id?: string;
					created_at?: string;
					extra?: Json | null;
					folder?: string;
					is_beta_reader?: boolean | null;
					is_like?: boolean | null;
					is_purchased?: boolean;
					is_shelved?: boolean;
					last_chapter_read?: string | null;
					stripe?: Json;
					tags?: string[] | null;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'book_id';
						columns: ['book_id'];
						isOneToOne: false;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'user_book_data_user_id_fkey1';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			user_chapter_data: {
				Row: {
					book_id: string;
					bookmark_notes: string;
					chapter_id: string;
					created_at: string;
					extra: Json;
					is_bookmark: boolean;
					is_like: boolean | null;
					is_purchased: boolean;
					rating: number;
					shelved: boolean;
					stripe: Json;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					book_id: string;
					bookmark_notes?: string;
					chapter_id: string;
					created_at?: string;
					extra?: Json;
					is_bookmark?: boolean;
					is_like?: boolean | null;
					is_purchased?: boolean;
					rating?: number;
					shelved?: boolean;
					stripe?: Json;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					book_id?: string;
					bookmark_notes?: string;
					chapter_id?: string;
					created_at?: string;
					extra?: Json;
					is_bookmark?: boolean;
					is_like?: boolean | null;
					is_purchased?: boolean;
					rating?: number;
					shelved?: boolean;
					stripe?: Json;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'book_id_fkey';
						columns: ['book_id'];
						isOneToOne: false;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'chapter_id_fkey';
						columns: ['chapter_id'];
						isOneToOne: false;
						referencedRelation: 'chapters';
						referencedColumns: ['id'];
					}
				];
			};
			user_chatroom_data: {
				Row: {
					ban_why: string | null;
					created_at: string | null;
					description: string;
					is_banned: boolean;
					is_joined: boolean;
					is_kicked: boolean | null;
					is_muted: boolean | null;
					joined_at: string | null;
					kick_reason: string | null;
					left_at: string | null;
					mute_duration: number | null;
					mute_start_date: string | null;
					name: string;
					reason: string | null;
					role: string | null;
					room_id: string;
					status: string;
					user_id: string;
				};
				Insert: {
					ban_why?: string | null;
					created_at?: string | null;
					description: string;
					is_banned?: boolean;
					is_joined?: boolean;
					is_kicked?: boolean | null;
					is_muted?: boolean | null;
					joined_at?: string | null;
					kick_reason?: string | null;
					left_at?: string | null;
					mute_duration?: number | null;
					mute_start_date?: string | null;
					name: string;
					reason?: string | null;
					role?: string | null;
					room_id: string;
					status?: string;
					user_id: string;
				};
				Update: {
					ban_why?: string | null;
					created_at?: string | null;
					description?: string;
					is_banned?: boolean;
					is_joined?: boolean;
					is_kicked?: boolean | null;
					is_muted?: boolean | null;
					joined_at?: string | null;
					kick_reason?: string | null;
					left_at?: string | null;
					mute_duration?: number | null;
					mute_start_date?: string | null;
					name?: string;
					reason?: string | null;
					role?: string | null;
					room_id?: string;
					status?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_chatroom_data_room_id_fkey';
						columns: ['room_id'];
						isOneToOne: false;
						referencedRelation: 'chatrooms';
						referencedColumns: ['room_id'];
					},
					{
						foreignKeyName: 'user_chatroom_data_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			user_comment_data: {
				Row: {
					comment_id: string;
					created_at: string;
					is_like: boolean | null;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					comment_id: string;
					created_at?: string;
					is_like?: boolean | null;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					comment_id?: string;
					created_at?: string;
					is_like?: boolean | null;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'comment_id';
						columns: ['comment_id'];
						isOneToOne: false;
						referencedRelation: 'comments';
						referencedColumns: ['id'];
					}
				];
			};
			user_editor_settings: {
				Row: {
					book_id: string;
					created_at: string;
					setting: Json;
					style: Json;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					book_id: string;
					created_at?: string;
					setting?: Json;
					style?: Json;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					book_id?: string;
					created_at?: string;
					setting?: Json;
					style?: Json;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'fk_constraint_name';
						columns: ['book_id'];
						isOneToOne: false;
						referencedRelation: 'books';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'user_editor_settings_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'user_id_fk';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			user_events: {
				Row: {
					created_at: string;
					event: string;
					event_data: Json | null;
					target_id: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					event: string;
					event_data?: Json | null;
					target_id: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					event?: string;
					event_data?: Json | null;
					target_id?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_events_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: true;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			user_global_configs: {
				Row: {
					author_invitation_count: number | null;
					count_reset_at: string;
					created_at: string;
					is_beta_reader: boolean | null;
					max_author_invitation_per_day: number;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					author_invitation_count?: number | null;
					count_reset_at?: string;
					created_at?: string;
					is_beta_reader?: boolean | null;
					max_author_invitation_per_day?: number;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					author_invitation_count?: number | null;
					count_reset_at?: string;
					created_at?: string;
					is_beta_reader?: boolean | null;
					max_author_invitation_per_day?: number;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_setting_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: true;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			user_message: {
				Row: {
					created_at: string;
					from: string;
					id: string;
					message: string;
					to: string;
					updated_at: string;
					user_modified_at: string;
				};
				Insert: {
					created_at?: string;
					from: string;
					id: string;
					message: string;
					to: string;
					updated_at?: string;
					user_modified_at?: string;
				};
				Update: {
					created_at?: string;
					from?: string;
					id?: string;
					message?: string;
					to?: string;
					updated_at?: string;
					user_modified_at?: string;
				};
				Relationships: [];
			};
			user_profile_data: {
				Row: {
					created_at: string;
					is_blocked: boolean;
					is_follower: boolean;
					self: string;
					target: string;
					updated_at: string;
					user_modified_at: string;
				};
				Insert: {
					created_at?: string;
					is_blocked?: boolean;
					is_follower?: boolean;
					self: string;
					target: string;
					updated_at?: string;
					user_modified_at?: string;
				};
				Update: {
					created_at?: string;
					is_blocked?: boolean;
					is_follower?: boolean;
					self?: string;
					target?: string;
					updated_at?: string;
					user_modified_at?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_profile_data_self_fkey';
						columns: ['self'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 'user_profile_data_target_fkey';
						columns: ['target'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			user_reader_settings: {
				Row: {
					book_id: number;
					created_at: string;
					setting: Json;
					style: Json;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					book_id: number;
					created_at?: string;
					setting?: Json;
					style?: Json;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					book_id?: number;
					created_at?: string;
					setting?: Json;
					style?: Json;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_reader_settings_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: false;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			user_review_data: {
				Row: {
					created_at: string;
					extra: Json;
					is_like: boolean | null;
					rating: number;
					review_id: string;
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					extra?: Json;
					is_like?: boolean | null;
					rating?: number;
					review_id: string;
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					extra?: Json;
					is_like?: boolean | null;
					rating?: number;
					review_id?: string;
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'review_id_fkey';
						columns: ['review_id'];
						isOneToOne: false;
						referencedRelation: 'reviews';
						referencedColumns: ['id'];
					}
				];
			};
			user_shelf_settings: {
				Row: {
					created_at: string;
					folders: string[];
					updated_at: string;
					user_id: string;
				};
				Insert: {
					created_at?: string;
					folders?: string[];
					updated_at?: string;
					user_id: string;
				};
				Update: {
					created_at?: string;
					folders?: string[];
					updated_at?: string;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: 'user_shelf_settings_user_id_fkey';
						columns: ['user_id'];
						isOneToOne: true;
						referencedRelation: 'profiles';
						referencedColumns: ['id'];
					}
				];
			};
			word_count: {
				Row: {
					time: string;
					user_id: string;
					word_count: number;
				};
				Insert: {
					time: string;
					user_id: string;
					word_count?: number;
				};
				Update: {
					time?: string;
					user_id?: string;
					word_count?: number;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			get_chapter: {
				Args: {
					chapter_id: number;
				};
				Returns: {
					author_id: string;
					authors_words: string;
					book_id: string;
					character_count: number;
					content: string;
					created_at: string;
					dislike_count: number;
					id: string;
					like_count: number;
					price: number;
					scheduled_publish_date: string | null;
					sequence: number;
					statistics_modified_at: string;
					status: string;
					title: string;
					updated_at: string;
					user_modified_at: string;
					word_count: number | null;
				};
			};
			get_chapter_content: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			getutc: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			search_books: {
				Args: {
					text: string;
					count: number;
					skip: number;
					sort: string;
				};
				Returns: {
					age_range: unknown | null;
					author_id: string;
					author_name: string;
					authors_words: string;
					average_rating: number | null;
					category: string;
					chapter_count: number;
					character_count: number;
					character_development_rating: number;
					cover_url: string;
					created_at: string;
					dislike_count: number;
					display_name: string | null;
					extra: Json | null;
					id: string;
					is_crawled: boolean;
					is_public_domain: boolean | null;
					is_visible: boolean;
					language: string;
					lead: string;
					level_of_immersion_rating: number;
					like_count: number;
					maturity_levels: string[] | null;
					maturity_ratings: string;
					plot_rating: number;
					price: number;
					audience: string;
					recommendation_count: number;
					review_count: number;
					sell_type: string;
					shelved_count: number;
					statistics_modified_at: string;
					status: string;
					summary: string;
					tags: string[];
					title: string;
					total_click: number;
					updated_at: string;
					user_modified_at: string;
					word_count: number | null;
					world_setting_rating: number;
					writing_rating: number;
				}[];
			};
			user_stats: {
				Args: {
					id: string;
				};
				Returns: number[];
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	storage: {
		Tables: {
			buckets: {
				Row: {
					allowed_mime_types: string[] | null;
					avif_autodetection: boolean | null;
					created_at: string | null;
					file_size_limit: number | null;
					id: string;
					name: string;
					owner: string | null;
					owner_id: string | null;
					public: boolean | null;
					updated_at: string | null;
				};
				Insert: {
					allowed_mime_types?: string[] | null;
					avif_autodetection?: boolean | null;
					created_at?: string | null;
					file_size_limit?: number | null;
					id: string;
					name: string;
					owner?: string | null;
					owner_id?: string | null;
					public?: boolean | null;
					updated_at?: string | null;
				};
				Update: {
					allowed_mime_types?: string[] | null;
					avif_autodetection?: boolean | null;
					created_at?: string | null;
					file_size_limit?: number | null;
					id?: string;
					name?: string;
					owner?: string | null;
					owner_id?: string | null;
					public?: boolean | null;
					updated_at?: string | null;
				};
				Relationships: [];
			};
			migrations: {
				Row: {
					executed_at: string | null;
					hash: string;
					id: number;
					name: string;
				};
				Insert: {
					executed_at?: string | null;
					hash: string;
					id: number;
					name: string;
				};
				Update: {
					executed_at?: string | null;
					hash?: string;
					id?: number;
					name?: string;
				};
				Relationships: [];
			};
			objects: {
				Row: {
					bucket_id: string | null;
					created_at: string | null;
					id: string;
					last_accessed_at: string | null;
					metadata: Json | null;
					name: string | null;
					owner: string | null;
					owner_id: string | null;
					path_tokens: string[] | null;
					updated_at: string | null;
					user_metadata: Json | null;
					version: string | null;
				};
				Insert: {
					bucket_id?: string | null;
					created_at?: string | null;
					id?: string;
					last_accessed_at?: string | null;
					metadata?: Json | null;
					name?: string | null;
					owner?: string | null;
					owner_id?: string | null;
					path_tokens?: string[] | null;
					updated_at?: string | null;
					user_metadata?: Json | null;
					version?: string | null;
				};
				Update: {
					bucket_id?: string | null;
					created_at?: string | null;
					id?: string;
					last_accessed_at?: string | null;
					metadata?: Json | null;
					name?: string | null;
					owner?: string | null;
					owner_id?: string | null;
					path_tokens?: string[] | null;
					updated_at?: string | null;
					user_metadata?: Json | null;
					version?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: 'objects_bucketId_fkey';
						columns: ['bucket_id'];
						isOneToOne: false;
						referencedRelation: 'buckets';
						referencedColumns: ['id'];
					}
				];
			};
			s3_multipart_uploads: {
				Row: {
					bucket_id: string;
					created_at: string;
					id: string;
					in_progress_size: number;
					key: string;
					owner_id: string | null;
					upload_signature: string;
					user_metadata: Json | null;
					version: string;
				};
				Insert: {
					bucket_id: string;
					created_at?: string;
					id: string;
					in_progress_size?: number;
					key: string;
					owner_id?: string | null;
					upload_signature: string;
					user_metadata?: Json | null;
					version: string;
				};
				Update: {
					bucket_id?: string;
					created_at?: string;
					id?: string;
					in_progress_size?: number;
					key?: string;
					owner_id?: string | null;
					upload_signature?: string;
					user_metadata?: Json | null;
					version?: string;
				};
				Relationships: [
					{
						foreignKeyName: 's3_multipart_uploads_bucket_id_fkey';
						columns: ['bucket_id'];
						isOneToOne: false;
						referencedRelation: 'buckets';
						referencedColumns: ['id'];
					}
				];
			};
			s3_multipart_uploads_parts: {
				Row: {
					bucket_id: string;
					created_at: string;
					etag: string;
					id: string;
					key: string;
					owner_id: string | null;
					part_number: number;
					size: number;
					upload_id: string;
					version: string;
				};
				Insert: {
					bucket_id: string;
					created_at?: string;
					etag: string;
					id?: string;
					key: string;
					owner_id?: string | null;
					part_number: number;
					size?: number;
					upload_id: string;
					version: string;
				};
				Update: {
					bucket_id?: string;
					created_at?: string;
					etag?: string;
					id?: string;
					key?: string;
					owner_id?: string | null;
					part_number?: number;
					size?: number;
					upload_id?: string;
					version?: string;
				};
				Relationships: [
					{
						foreignKeyName: 's3_multipart_uploads_parts_bucket_id_fkey';
						columns: ['bucket_id'];
						isOneToOne: false;
						referencedRelation: 'buckets';
						referencedColumns: ['id'];
					},
					{
						foreignKeyName: 's3_multipart_uploads_parts_upload_id_fkey';
						columns: ['upload_id'];
						isOneToOne: false;
						referencedRelation: 's3_multipart_uploads';
						referencedColumns: ['id'];
					}
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			can_insert_object: {
				Args: {
					bucketid: string;
					name: string;
					owner: string;
					metadata: Json;
				};
				Returns: undefined;
			};
			extension: {
				Args: {
					name: string;
				};
				Returns: string;
			};
			filename: {
				Args: {
					name: string;
				};
				Returns: string;
			};
			foldername: {
				Args: {
					name: string;
				};
				Returns: string[];
			};
			get_size_by_bucket: {
				Args: Record<PropertyKey, never>;
				Returns: {
					size: number;
					bucket_id: string;
				}[];
			};
			list_multipart_uploads_with_delimiter: {
				Args: {
					bucket_id: string;
					prefix_param: string;
					delimiter_param: string;
					max_keys?: number;
					next_key_token?: string;
					next_upload_token?: string;
				};
				Returns: {
					key: string;
					id: string;
					created_at: string;
				}[];
			};
			list_objects_with_delimiter: {
				Args: {
					bucket_id: string;
					prefix_param: string;
					delimiter_param: string;
					max_keys?: number;
					start_after?: string;
					next_token?: string;
				};
				Returns: {
					name: string;
					id: string;
					metadata: Json;
					updated_at: string;
				}[];
			};
			operation: {
				Args: Record<PropertyKey, never>;
				Returns: string;
			};
			search: {
				Args: {
					prefix: string;
					bucketname: string;
					limits?: number;
					levels?: number;
					offsets?: number;
					search?: string;
					sortcolumn?: string;
					sortorder?: string;
				};
				Returns: {
					name: string;
					id: string;
					updated_at: string;
					created_at: string;
					last_accessed_at: string;
					metadata: Json;
				}[];
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
	PublicTableNameOrOptions extends
		| keyof (PublicSchema['Tables'] & PublicSchema['Views'])
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
				Database[PublicTableNameOrOptions['schema']]['Views'])
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
			Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
				PublicSchema['Views'])
		? (PublicSchema['Tables'] &
				PublicSchema['Views'])[PublicTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	PublicTableNameOrOptions extends
		| keyof PublicSchema['Tables']
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends
		| keyof PublicSchema['Tables']
		| { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
		: never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema['Tables']
		? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	PublicEnumNameOrOptions extends
		| keyof PublicSchema['Enums']
		| { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
		? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
		: never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
		? PublicSchema['Enums'][PublicEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof PublicSchema['CompositeTypes']
		| { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
		: never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema['CompositeTypes']
		? PublicSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
		: never;
