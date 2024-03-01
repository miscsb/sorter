<script lang=ts>
    import { RaceSort } from "$lib/racesort";
	import type { Track } from "@spotify/web-api-ts-sdk";
	import { LocalStorage } from "carbon-components-svelte";
    import type { PageData } from "./$types";
    export let data: PageData;

    let sorter : RaceSort<Track> = new RaceSort(5, data.songs);
    $: currentRace = sorter.findRace();
    console.log(sorter);

</script>

<LocalStorage key="sorter" bind:value={sorter}/>
