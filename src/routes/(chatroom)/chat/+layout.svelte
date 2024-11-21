<script>
	import BanUser from './BanUser.svelte';
	import ChatManage from './ChatManage.svelte';
	import KickUser from './KickUserDraw.svelte';
	import MuteModal from './MuteDialog.svelte';
	import Promotion from './Promotion.svelte';
	import { chatStore } from './store.svelte';
	import Resources from './Resources.svelte';
	import UserInboxes from './UserInboxes.svelte';

	let { children } = $props();
</script>

{@render children()}

<!-- <ActionAlertMute room_user={chatStore.user} /> -->
<BanUser room_user={chatStore.user} />
<ChatManage room_user={chatStore.user} />
<MuteModal room_user={chatStore.user} />
<Promotion room_user={chatStore.user} />
<KickUser room_user={chatStore.user} />
<Resources />
<UserInboxes />
