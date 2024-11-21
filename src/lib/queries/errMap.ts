export function mapSQLError(s: string) {
	if (s.includes('duplicate value')) {
		return 'Duplicate Data Detected !';
	}
}
