<script lang=ts>
    import { Button, FormGroup, Form, TextInput } from 'carbon-components-svelte';

    let playlistUrl      : string = "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M";
    let nameRegexInput   : string = "^.*$";
    let artistRegexInput : string = "^.*$";

    $: playlistId  = parseUrl(playlistUrl);
    $: nameRegex   = validate(nameRegexInput);
    $: artistRegex = validate(artistRegexInput);

    function parseUrl(url: string): null | string {
        const regex = /(?<=playlist[:\/])[a-zA-Z0-9]+/;
        let m = regex.exec(url);
        if (m === null) return null;
        
        let result = null;
        m.forEach((match, groupIndex) => {
            if (groupIndex == 0) {
                result = match;
            }
        });
        return result;
    };

    function validate(regex: string): null | string {
        try {
            new RegExp(regex);
            return regex;
        } catch (e) {
            return null;
        }
    }

    function handleFormSubmit() {
        if (playlistId && nameRegex && artistRegex) {
            let params = new URLSearchParams();
            params.append('playlistId', playlistId);
            params.append('nameRegex', nameRegex);
            params.append('artistRegex', artistRegex);
            window.location.href = `/sorter?${params.toString()}`;
        }
    };
</script>

<h1>Sorter Setup</h1>
<br />
<Form on:submit={handleFormSubmit}>
    <FormGroup>
        <TextInput required
            labelText="Playlist URL or URI" 
            placeholder="Enter Playlist URL..." 
            bind:value={playlistUrl} 
            
            helperText="Playlist ID: {playlistId}"
            invalid={playlistId === null}
            invalidText="Invalid URL" />
        <br />
        <TextInput
            labelText="Name Regex"
            placeholder="Enter regex to match the song name on..." 
            bind:value={nameRegexInput} 
            
            invalid={nameRegex === null}
            invalidText="Invalid regex" />
        <br />
        <TextInput
            labelText="Artist Regex"
            placeholder="Enter regex to match the artist name on..." 
            bind:value={artistRegexInput}

            invalid={artistRegex === null}
            invalidText="Invalid regex" />
    </FormGroup>
    <br />
    <Button type="submit">Let's sort!</Button>
</Form>
