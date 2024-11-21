<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from 'paneforge';
</script>

<PaneGroup direction="horizontal">
	<Pane defaultSize={50}>Pane 1</Pane>
	<PaneResizer />
	<Pane defaultSize={50}>Pane 2</Pane>
</PaneGroup>
