export const profileStore = $state({ openBucketDialog: false });

export function openAddBucketDialog() {
	profileStore.openBucketDialog = true;
}
