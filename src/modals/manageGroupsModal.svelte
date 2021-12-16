<script lang="ts">
  import Select from 'svelte-select';
  import type { Group } from '~/models';
  export let groups: Group[];
  export let onSubmit: (value) => void;
  let selectedGroups = groups.filter((group) => group.selected);
  let disabledButton = true;
  let value;
  const optionIdentifier = 'id';
  const labelIdentifier = 'name';
  function handleSelect(event) {
    disabledButton = !selectedGroups;
  }
  function handleClear(event) {
    disabledButton = !selectedGroups;
  }
</script>

<div class="setting-item">
  <div class="setting-item-info">
    <div class="setting-item-description">
      <div class="ow-dropdown ow-themed">
        <p>
          <Select
            bind:value={selectedGroups}
            isMulti={true}
            {optionIdentifier}
            {labelIdentifier}
            items={groups}
            on:select={handleSelect}
            on:clear={handleClear}
          />
        </p>
      </div>
    </div>
  </div>
</div>

<div class="setting-item ow-info">
  <div class="setting-item-info">
    <div class="setting-item-description">Note: Use with caution. <br />Highlight(s) and annotation(s) will not sync retroactively.</div>
  </div>
  <div class="setting-item-control">
    <button class="mod-cta" disabled={disabledButton} style="float: right" on:click={() => onSubmit({ selectedGroups })}>Save</button>
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
