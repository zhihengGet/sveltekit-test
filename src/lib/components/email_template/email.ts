export const batchSendBetaReadMailHTML = ({
	author,
	to,
	words,
	book_name,
	username,
	url,
	book_id,
	description,
	cover_url
}: {
	to: string;
	author: string;
	words: string;
	book_name: string;
	url: string;
	book_id: string | number;
	cover_url: string;
	description: string;
	username?: string;
}) => {
	return `
		<html>
			<head>
				<style>
					body {
						font-family: Arial, sans-serif;
						margin: 0;
						padding: 0;
						background-color: #f4f4f4;
					}
					.container {
						max-width: 600px;
						margin: 20px auto;
						background-color: #ffffff;
						border: 1px solid #dddddd;
						border-radius: 5px;
						padding: 20px;
					}
					.header {
						display: flex;
						justify-content: space-between;
						align-items: center;
						margin-bottom: 20px;
					}
					.author-info {
						display: flex;
						align-items: center;
					}
					.author-avatar {
						width: 50px;
						height: 50px;
						border-radius: 50%;
						margin-right: 10px;
					}
					.author-name {
						font-weight: bold;
						font-size: 18px;
					}
					.author-title {
						color: #666666;
						font-size: 14px;
					}
					.date {
						color: #666666;
						font-size: 14px;
						margin-left: 20px;
					}
					.content {
						margin-bottom: 20px;
					}
					.title {
						font-size: 24px;
						font-weight: bold;
						margin-bottom: 10px;
					}
					.description {
						background-color: #f9f9f9;
						border-left: 4px solid #cccccc;
						padding: 10px;
						margin: 10px 0;
						font-style: italic;
					}
					.cta-button {
						display: inline-block;
						background-color: #007bff;
						color: #ffffff;
						text-decoration: none;
						padding: 10px 20px;
						border-radius: 5px;
						font-weight: bold;
					}
					div > a .cta-button {
						color: #ffffff;
					}
					.footer {
						margin-top: 20px;
						font-size: 12px;
						color: #666666;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div class="header">
						<div class="author-info">
							<img
								class="author-avatar"
								style="background-color:gray"
								src="${cover_url}"
								alt=""
							/>
							<div>
								<div class="author-name">${author}</div>
								<div class="author-title">Author</div>
							</div>
						</div>
						<div class="date" style="">
							${new Date().toISOString().split('T')[0]}
						</div>
					</div>
					<div class="content">
						<h1 class="title">Request for Book Review</h1>
						<p>Dear ${username?.trim()},</p>
						<p>${words.trim()}</p>
						<div class="description">${description.substring(0, 500).trim()}</div>
					</div>
					<div style="text-align: center;">
						 <a href="${url}" class="btn" style="display: inline-block; padding: 10px 20px; color: #ffffff !important; background-color: #007BFF; text-decoration: none; font-size: 14px; border-radius: 4px; border: 1px solid #007BFF;">Read the Book</a>
						<p style="margin-top: 10px; font-size: 14px; color: #666666;">
							or reply to this email with your thoughts
						</p>
					</div>
					<div class="footer">
						To opt out of this, please go to the
						<a href="www.forkread.com/book/${book_id}">book</a>
						and click reject beta review button
					</div>
				</div>
			</body>
		</html>
	`;
};
