<script lang="ts">
	import Drawer from '$components/Drawer.svelte';
	import Dropdown from '$components/dropdown.svelte';
	import { OvalSpinner } from '$lib/icons';
	import useUpload, { uploadAvatar } from '$lib/queries/storage/useUpload';
	import { dataURLtoFile } from '$lib/utils/fileUtils';
	import { onDestroy, type Snippet } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import Camera from 'lucide-svelte/icons/camera'
import StopCircle from 'lucide-svelte/icons/stop-circle'
import CameraIcon from 'lucide-svelte/icons/camera';
	let video: HTMLVideoElement | undefined = $state();
	let canvas: HTMLCanvasElement | undefined = $state();
	let photo: HTMLElement | undefined = $state();
	let width: number = $state(300);
	let height: number = $state(300);
	let streamingStatus: 'idle' | 'loading' | 'started' | 'stopped' =
		$state('idle');
	const upload = useUpload('avatar');
	/* let {}: {
		img?: Snippet<[{ photo: (n: HTMLImageElement) => void }]>;
		url: string;
	} = $props(); */
	export function stop() {
		if (video && video.srcObject) {
			const tracks = (video.srcObject as MediaStream)?.getTracks();
			tracks.forEach((track) => track.stop());
			streamingStatus = 'idle';
			video.srcObject = null;
		}
	}
	//https://developer.mozilla.org/en-US/docs/Web/API/Media_Capture_and_Streams_API/Taking_still_photos#using_specific_devices
	function turnVideo(constraints: MediaStreamConstraints) {
		stop();
		startup(constraints);
	}
	function showViewLiveResultButton() {
		if (window.self !== window.top) {
			return true;
			// Ensure that if our document is in a frame, we get the user
			// to first open it in its own tab or window. Otherwise, it
			// won't be able to request permission for camera access.
			//document.querySelector('.contentarea').remove();
			/* const button = document.createElement('button');
			button.textContent = 'View live result of the example code above';
			document.body.append(button);
			button.addEventListener('click', () => window.open(location.href));
			return true; */
		}
		return false;
	}
	const abort = new AbortController();

	export function startup(
		costraints: MediaStreamConstraints = { video: true }
	) {
		o = true;
		stop();
		if (streamingStatus == 'started') {
			streamingStatus = 'idle';
			return;
		}
		if (showViewLiveResultButton() || !video) {
			return;
		}
		streamingStatus = 'loading';
		navigator.mediaDevices
			.getUserMedia(costraints)
			.then((stream) => {
				video.srcObject = stream;
				video.play();
				streamingStatus = 'started';
			})
			.catch((err) => {
				console.error(`An error occurred: ${err}`);
			});

		video.addEventListener(
			'canplay',
			(ev) => {
				if (streamingStatus !== 'started' && video && canvas) {
					height = video.videoHeight / (video.videoWidth / width);
					// Firefox currently has a bug where the height can't be read from
					// the video, so we will make assumptions if this happens.
					if (isNaN(height)) {
						height = width / (4 / 3);
					}
					video.setAttribute('width', width + '');
					video.setAttribute('height', height + '');
					canvas.setAttribute('width', width + '');
					canvas.setAttribute('height', height + '');
				}
			},
			abort
		);

		clearphoto();
	}
	onDestroy(() => {
		stop();
		abort.abort();
	});

	let image = '';
	function clearphoto() {
		if (!canvas || !photo) return;
		const context = canvas.getContext('2d');
		if (!context) return;
		context.fillStyle = '#AAA';
		context.fillRect(0, 0, canvas.width, canvas.height);
		const data = canvas.toDataURL('image/png');
		image = data;
		photo.setAttribute('src', data);
	}

	// Capture a photo by fetching the current contents of the video
	// and drawing it into a canvas, then converting that to a PNG
	// format data URL. By drawing it on an offscreen canvas and then
	// drawing that to the screen, we can change its size and/or apply
	// other changes before drawing it.
	let dataUri = $state('');
	function takepicture() {
		if (!canvas) return;
		const context = canvas.getContext('2d');
		if (width && height && context) {
			canvas.width = width;
			canvas.height = height;
			context.drawImage(video, 0, 0, width, height);

			const data = canvas.toDataURL('image/png');
			photo?.setAttribute('src', data);
			dataUri = data;
		} else {
			clearphoto();
		}
	}
	let valid_cameras: MediaDeviceInfo[] = $state([]);
	async function getCameraFacingInfo() {
		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			const videoDevices = devices.filter(
				(device) => device.kind === 'videoinput'
			);
			videoDevices.forEach((device) => {
				valid_cameras.push(device);
			});
		} catch (err) {
			console.error('Error accessing media devices:', err);
		}
	}
	$effect(() => {
		getCameraFacingInfo();
	});
	let o = $state(false);
	$effect(() => {
		if (o == false) {
			stop();
		}
	});
</script>

{#snippet Buttons({
	text,
	click,
	...props
}: {
	text: string;
	class?: string;
	click: any;
})}
	<button
		onclick={click}
		class="relative mx-1 h-fit overflow-hidden rounded-md bg-neutral-800 px-4px py-1px w-fit text-white transition-all duration-300 [transition-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)] active:-translate-y-1 active:scale-x-90 active:scale-y-110 {props.class}"
		{...props}
	>
		{text}
	</button>
{/snippet}

<Drawer
	bind:open={o}
	title="Take A Photo  !"
	description="Use selfie as a avatar !"
	class="sm:max-w-[500px]"
>
	{#if streamingStatus === 'loading'}
		<OvalSpinner />
	{/if}
	<div class="flex space-x-2">
		<Button
			onclick={() => startup()}
			class="flex mb-1 items-center"
			disabled={streamingStatus !== 'idle'}
		>
			<Camera class="mb-1 h-4 w-4" /> Start Camera
		</Button>
		<Button
			onclick={() => stop()}
			class="flex mb-1 items-center"
			disabled={streamingStatus == 'idle'}
		>
			<StopCircle class=" h-4 w-4" /> Stop Camera
		</Button>

		<Button onclick={takepicture} disabled={streamingStatus == 'idle'}>
			<CameraIcon class="mb-1 h-4 w-4" /> Take Photo
		</Button>
	</div>
	<!-- svelte-ignore a11y_media_has_caption -->
	<video
		bind:this={video}
		id="video"
		class="border-1 shadow"
		class:hidden={streamingStatus != 'started'}
	>
		Video stream not available.
	</video>
	<canvas id="canvas" bind:this={canvas} class="hidden"></canvas>
	<!-- <div>
		{@render Buttons({
			text: streamingStatus !== 'started' ? 'Start' : 'Stop',
			click: () => startup({ video: true }),
			class: 'bg-green-200 px-2 border-1 shadow '
		})}
	</div> -->
	<!-- <div
		class:flex={streamingStatus == 'started'}
		class:hidden={streamingStatus != 'started'}
	>
		{@render Buttons({ text: 'Stop', click: stop })}
		{@render Buttons({
			text: 'Take A Photo',
			click: (ev) => {
				ev.preventDefault();
				takepicture();
			}
		})}
	</div> -->
	<span class:hidden={streamingStatus != 'started'}>
		<Dropdown
			title="Select an source"
			buttonString="Select Camera"
			items={{
				Cameras: valid_cameras.map((v) => {
					return {
						onClick: () => {
							startup({ video: { deviceId: v.deviceId } });
						},
						str: v.label
					};
				})
			}}
		/>
	</span>
	<img
		id="photo"
		bind:this={photo}
		alt="The screen capture will appear in this box."
	/>
	{#snippet footer()}
		<Button
			variant="destructive"
			onclick={() => {
				o = false;
			}}
		>
			Close
		</Button>
		<Button
			disabled={!dataUri}
			onclick={() => {
				upload.mutate({ file: dataURLtoFile(dataUri, 'self.png') });
			}}
		>
			Upload
		</Button>
	{/snippet}
</Drawer>
