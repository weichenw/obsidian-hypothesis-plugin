<script lang="ts">
    import type { SyncedFile } from '~/models';
    export let deletedFiles: SyncedFile[];
    export let onSubmit: (value) => void;
    let selected;
    let disabledButton = deletedFiles.length === 0 ? true : false;
    let description = disabledButton ? 'No deleted files found...' : 'Select a file to resync from Hypothes.is';
</script>
<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item-description">
            <p>
                <select bind:value={selected} class="dropdown ow-dropdown">
                    {#each deletedFiles as file}
                    <option value={file}>
                        {file.filename}
                    </option>
                    {/each}
                </select>
            </p>
        </div>
    </div>
</div>

<div class="setting-item ow-info">
    <div class="setting-item-info">
        <div class="setting-item-description">
            {description}
        </div>
    </div>
    <div class="setting-item-control">
        <button class="mod-cta" disabled={disabledButton} style="float: right" on:click={()=>
            onSubmit({selected})}>Sync</button>
    </div>
</div>

<style>
    .ow-info {
        padding-top: 0px;
        border-top: 0px !important;
    }

    .ow-dropdown {
        width: 500px !important;
    }
</style>