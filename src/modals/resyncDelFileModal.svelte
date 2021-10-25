<script lang="ts">
    import Select from 'svelte-select';
    import type { SyncedFile } from '~/models';
    export let deletedFiles: SyncedFile[];
    export let onSubmit: (value) => void;
    let selected;
    let disabledButton = true;
    let description = deletedFiles.length === 0 ? 'No deleted file(s) found...' : 'Select file(s) to resync from Hypothes.is';
    let value;
    const optionIdentifier = 'uri';
    const labelIdentifier = 'filename';
    function handleSelect(event) {
        disabledButton = !selected
    }
    function handleClear(event) {
        disabledButton = !selected
    }
</script>

<div class="setting-item">
    <div class="setting-item-info">
        <div class="setting-item-description">
            <div class="ow-dropdown ow-themed">
                <p>
                    <Select bind:value={selected} class="ow-themed" isMulti={true} {optionIdentifier} {labelIdentifier}
                        items={deletedFiles} on:select={handleSelect} on:clear={handleClear}>
                    </Select>
                </p>
            </div>

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

    .ow-themed {
        --border: 3px solid var(--background-modifier-border) !important;
        --borderRadius: 3px;
        --placeholderColor: var(--text-muted) !important;
        --background: var(--background-secondary-alt) !important;
        --itemColor: var(--text-normal) !important;
        --itemHoverBG: var(--interactive-accent-hover) !important;
        --itemHoverColor: var(--text-on-accent) !important;
        --listBackground: var(--interactive-normal) !important;
    }
</style>