## Obsidian Hypothesis Plugin (Community Plugin)

Obsidian Hypothesis (Community Plugin) is an unofficial plugin to synchronize [Hypothesis](https://hypothes.is/) highlights into your Obsidian Vault.

<a href="https://www.buymeacoffee.com/fatwombat"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=fatwombat&button_colour=BD5FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00"></a>

### Features

- Sync article highlights on Obsidian startup or manual trigger
- Update existing articles with new highlights and annotations
- Customization highlights through [Nunjucks](https://mozilla.github.io/nunjucks) template

## Usage

After installing the plugin, configure the the settings of the plugin then initiate the first sync manually. Thereafter, the plugin can be configured to sync automatically or manually

### Settings

- `Connect`: Enter [API Token](https://hypothes.is/account/developer) in order to pull the highlights from Hypohesis
- `Disconnect`: Remove API Token from Obsidian
- `Highlights folder`: Specify the folder location for your Hypothesis articles
- `Sync on startup`: Automatically sync highlights when open Obsidian
- `Highlights template`: Nunjuck template for rendering your highlights
- `Reset sync`: Wipe your sync history. Does not delete any previously synced highlights from your vault

### To sync all new highlights since previous update

- Command: Sync new highlights
- Click: Hypothesis ribbon icon

## Limitations

Limit to 100 highlights per sync for performance. Pagination of result sets in the API does not seem to work. Hopefully, this will be fixed in their API v2.0

## Acknowledgement

This project is inspired by Hady Ozman's [Obsidian Kindle Plugin](https://github.com/hadynz/obsidian-kindle-plugin).

## Do you find this plugin useful?

<a href="https://www.buymeacoffee.com/fatwombat"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=fatwombat&button_colour=BD5FFF&font_colour=ffffff&font_family=Cookie&outline_colour=000000&coffee_colour=FFDD00"></a>

Thank you for your support 🙏
