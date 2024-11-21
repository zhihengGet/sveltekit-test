<!-- <script lang="ts">
	import { Editor } from 'editor';
	import {
		setSettingContext,
		type settings
	} from 'editor/src/settings/appSettings';

	import Spinner from '$lib/icons/spinner.svelte';
	import type { Writable } from 'svelte/store';
	import { viewStatus } from '.';

	export let html: string = '<p>Please write something...</p>';
	export let status: settings['status'] = viewStatus;
	export let userSetting: settings = {
		richtext: true,
		heading: true,
		readonly: true,
		autocomplete: false,
		toolbar: false,
		isDevMode: false,
		upload: false,
		download: false,
		initDataHTML: html,
		status: status
	};
	setSettingContext(userSetting);

	const data = userSetting.status;
	$: isLoading = $data == 'dataLoaded';
</script>

<Editor on:editorChange />
 -->
