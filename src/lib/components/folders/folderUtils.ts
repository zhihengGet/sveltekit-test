// check if a folder is an default folder or not

export function isDefaultFolder(
	folder: string | undefined = '',
	folderList: string[] = []
) {
	return (
		!folder ||
		folderList.includes(folder) == false ||
		folder.trim().toLowerCase() == 'default'
	);
}
export function getFolderName(s: string) {
	return !s || s == 'default' ? 'default' : s;
}
