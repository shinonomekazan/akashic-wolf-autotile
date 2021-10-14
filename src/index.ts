import * as tile from "@akashic-extension/akashic-tile";

export class WolfAutoTile extends tile.Tile {
	renderCache(renderer: g.Renderer): void {
		if (!this.tileData)
			throw g.ExceptionFactory.createAssertionError(
				"WolfAutoTile#_renderCache: don't have a tile data"
			);
		if (this.tileWidth <= 0 || this.tileHeight <= 0) {
			return;
		}
		renderer.save();

		for (let y = 0; y < this.tileData.length; ++y) {
			const row = this.tileData[y];
			for (let x = 0; x < row.length; ++x) {
				const tile = row[x];
				if (tile < 0) {
					continue;
				}

				if (this._drawnTileData[y] !== undefined) {
					if (this._drawnTileData[y][x] === tile) {
						continue;
					}
				}

				const dx = this.tileWidth * x;
				const dy = this.tileHeight * y;

				if (this.redrawArea) {
					if (
						dx + this.tileWidth < this.redrawArea.x ||
						dx >= this.redrawArea.x + this.redrawArea.width ||
						dy + this.tileHeight < this.redrawArea.y ||
						dy >= this.redrawArea.y + this.redrawArea.height
					) {
						continue;
					}
				}

				renderer.setCompositeOperation("destination-out");
				renderer.fillRect(
					dx,
					dy,
					this.tileWidth,
					this.tileHeight,
					"silver"
				); // DestinationOutなので色はなんでも可
				renderer.setCompositeOperation("source-over");
				const tw2 = Math.floor(this.tileWidth / 2);
				const th2 = Math.floor(this.tileHeight / 2);
				for (let i = 0; i < 2; ++i) {
					for (let j = 0; j < 2; ++j) {
						const nx = x + (i === 0 ? -1 : 1);
						const ny = y + (j === 0 ? -1 : 1);
						const nearTiles = [
							this._getTile(x, ny),
							this._getTile(nx, y),
							this._getTile(nx, ny),
						];
						let offset = 0;
						if (nearTiles[0] === tile) {
							offset += 1;
						}
						if (nearTiles[1] === tile) {
							offset += 2;
						}
						if (nearTiles[2] === tile && offset === 3) {
							offset += 1;
						}

						// 通常のタイル仕様だとこうだが、ウディタのアニメーションタイルのために5固定にする
						// const tileX = this.tileWidth * ((tile + offset) % this._tilesInRow) + i * tw2;
						// const tileY = this.tileHeight * Math.floor((tile + offset) / this._tilesInRow) + j * th2;
						const tileX =
							this.tileWidth * Math.floor((tile + offset) / 5) +
							i * tw2;
						const tileY =
							this.tileHeight * ((tile + offset) % 5) + j * th2;

						renderer.drawImage(
							this.tileChips,
							tileX,
							tileY,
							tw2,
							th2,
							dx + i * tw2,
							dy + j * th2
						);
					}
				}
				this._drawnTileData[y][x] = this.tileData[y][x];
			}
		}
		renderer.restore();
	}

	_getTile(x: number, y: number) {
		if (x < 0 || y < 0) return -1;
		if (y >= this.tileData.length) return -1;
		if (x >= this.tileData[y].length) return -1;
		return this.tileData[y][x];
	}
}
