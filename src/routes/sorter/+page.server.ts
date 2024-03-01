import { SpotifyApi, type Page, type Track, type PlaylistedTrack } from "@spotify/web-api-ts-sdk";
import type { PageServerLoad } from './$types';
import dotenv from 'dotenv';

export const load: PageServerLoad = async ({ url }) => {
    dotenv.config();
    const api = SpotifyApi.withClientCredentials(
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET
    );

    console.log("url is " + url.href);
    const urlParams = new URLSearchParams(url.search);
    const playlistId  = urlParams.get('playlistId')!;
    const nameRegex   = new RegExp(urlParams.get('nameRegex')!);
    const artistRegex = new RegExp(urlParams.get('artistRegex')!);

    let songs : Track[] = [];

    let namePredicate   = (track: Track) => nameRegex.test(track.name);
    let artistPredicate = (track: Track) => track.artists.some(artist => artistRegex.test(artist.name));

    let chunk = await api.playlists.getPlaylistItems(playlistId);
    songs = songs.concat(
        chunk.items.map(item => item.track).filter(namePredicate).filter(artistPredicate)
    );
    while (chunk.next !== null) {
        console.log(chunk.next);
        chunk = (await api.makeRequest('GET', chunk.next)) as Page<PlaylistedTrack<Track>>;
        songs = songs.concat(
            chunk.items.map(item => item.track).filter(namePredicate).filter(artistPredicate)
        );
    }

	return {
		songs: songs
	};
};
