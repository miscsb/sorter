<script lang=ts>
    import { RaceSort } from "$lib/racesort";
	import type { Track } from "@spotify/web-api-ts-sdk";
	import { LocalStorage, ClickableTile, Column, Grid, Row, Button, DataTable, Tooltip } from "carbon-components-svelte";
    import { TreeChart } from '@carbon/charts-svelte'
    import '@carbon/charts-svelte/styles.css'
    import type { PageData } from "./$types";
	import { afterUpdate, beforeUpdate, onMount } from "svelte";
	import { flip } from "svelte/animate";
    
    let raceNumber : number = 1;

    export let data: PageData;
    let sorter : RaceSort<Track> = new RaceSort(5, data.songs, song => song.name);
    let currentRace = sorter?.findRace() ?? [];

    const options = {
        title: '',
        height: '800px',
        tree: {
            type: 'dendrogram',
            rootTitle: ' '
        }
    }

    function updateSorter() {
        sorter.runRace(currentRace);
        sorter = sorter;
        currentRace = sorter.findRace() ?? [];
    }

    afterUpdate(() => {
       const elements = document.getElementsByClassName('decrease-volume');
       for (let i = 0; i < elements.length; i++) {
            const element = elements.item(i) as HTMLAudioElement;
            element.volume = 0.4;
        }
    });

    const dragDuration = 300
	let draggingCard : Track | undefined;
	let animatingCards = new Set();
 
	function swapWith(card : Track) {
		if (draggingCard === undefined || draggingCard === card || animatingCards.has(card)) return
		animatingCards.add(card)
		setTimeout(() => animatingCards.delete(card), dragDuration)
		const cardAIndex = currentRace.indexOf(draggingCard)
		const cardBIndex = currentRace.indexOf(card)
        if (Math.abs(cardAIndex - cardBIndex) > 1) return;
		currentRace[cardAIndex] = card
		currentRace[cardBIndex] = draggingCard
	}

    onMount(() => {
        document.addEventListener("dragstart", function( event ) {
            let img = new Image();
            img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
            event.dataTransfer?.setDragImage(img, 0, 0);
        }, false);
    })

    $: result = (sorter.toArray() ?? []).map((song, i) => { return {
        id: i + 1,
        rank: i + 1,
        name: song.name,
        artist: song.artists[0].name,
    };});
</script>

{#if currentRace.length > 0}
    <h1>Sorting "{data.title}"</h1>
    <br/>
    <h3>Race {raceNumber}</h3>
    <br/>
    <Button on:click={() => { updateSorter(); raceNumber = raceNumber + 1;}}>
        Run Race
    </Button>
    <br/><br/>
    <p>Drag the boxes around to order them from best to worst -- a higher position corresponds to a higher rank.</p>
    <br/><br/>
{:else}
    <h1>Sorted "{data.title}"</h1>
    <br />
{/if}

{#if currentRace.length > 0}
    <Column>
        {#each currentRace as participant (participant)}
            <div class='tile' 
                draggable={true}
                animate:flip={{ duration: dragDuration }}
                on:dragstart={() => draggingCard = participant}
                on:dragend={() => draggingCard = undefined}
                on:dragenter={() => swapWith(participant)}
                on:dragover|preventDefault
                role='button' tabindex="0">
                <ClickableTile on:click={e => {e.preventDefault();}}>
                    <Grid condensed={true} as={true}>
                        <Row>
                            <Column>
                                <img src={participant.album.images[1].url} width='80px' alt='' />
                            </Column>
                            <Column>
                                <h5>{participant.name}<h4>
                                <p>{participant.artists[0].name}</p>
                            </Column>
                            <Column>
                                <audio class="decrease-volume" controls style="width: 50%; height: 40px;">
                                    <source src="{participant.preview_url}" type="audio/mp3">
                                    Your browser does not support the audio element.
                                </audio> 
                            </Column>
                        </Row>
                    </Grid>
                </ClickableTile>
            </div>
        {/each}
    </Column>
    <br/>
{:else}
<DataTable 
    headers={[
        { key: "rank", value: "Rank" },
        { key: "name", value: "Name" },
        { key: "artist", value: "Artist" },
    ]}
    rows={result}
/>
{/if}
