<script lang="ts">
    import { onMount } from 'svelte'
    import { themes } from './themes'

    let currentTheme = "";

    onMount(() => {
        if (typeof window !== 'undefined') {
            const theme = window.localStorage.getItem('theme');

            if (theme && themes.filter(availableTheme => availableTheme.name === theme)) {
                document.documentElement.setAttribute('data-theme', theme);
                currentTheme = theme;
            }
        }
    })

    function setTheme(event: Event) {
        const select = event.target as HTMLSelectElement;
        const theme = select.value;
        if (themes.filter(availableTheme => availableTheme.name === theme)) {
            const oneYear = 60 * 60 * 24 * 365;
            window.localStorage.setItem('theme', theme);
            document.cookie = `theme=${theme}; max-age=${oneYear}; path=/; SameSite=Strict;`;
            document.documentElement.setAttribute('data-theme', theme);
            currentTheme = theme;
        }
    }
</script>

<div>
  <select
    bind:value={currentTheme}
    data-choose-theme
    class="select select-bordered"
    on:change={setTheme}
  >
    {#each themes as theme}
      <option value={theme.name}>{theme.label}</option>
    {/each}
  </select>
</div>