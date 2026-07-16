// ============================================================
// Nexus Realms — Inventory UI
// Grid of 36 slots, drag-and-drop, tooltips, equipment
// paper doll, gold display, sort/filter
// ============================================================

import Phaser from 'phaser';
import { ItemInstance, ItemRarity, EquipmentSlot, GAME_CONFIG, RARITY_COLORS } from '../../shared/types';

interface SlotGraphics {
  bg: Phaser.GameObjects.Graphics;
  hitArea: Phaser.GameObjects.Rectangle;
  itemGfx: Phaser.GameObjects.Graphics;
  itemText: Phaser.GameObjects.Text;
  rarityBorder?: Phaser.GameObjects.Graphics;
  qtyText?: Phaser.GameObjects.Text;
  x: number;
  y: number;
  size: number;
}

// ─── Constants ───────────────────────────────────────────────
const SLOT_SIZE = 40;
const SLOT_GAP = 4;
const COLS = 6;
const ROWS = 6;
const PANEL_PADDING = 12;
const EQUIP_SLOT_SIZE = 44;

// ─── Inventory UI ────────────────────────────────────────────
export class InventoryUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private visible: boolean = false;

  // Inventory slots
  private slotGraphics: SlotGraphics[] = [];
  private slotItems: (ItemInstance | null)[] = new Array(GAME_CONFIG.INVENTORY_SLOTS).fill(null);

  // Equipment slots
  private equipSlotGraphics: Map<EquipmentSlot, SlotGraphics> = new Map();
  private equipItems: Map<EquipmentSlot, ItemInstance> = new Map();

  // Tooltip
  private tooltipContainer!: Phaser.GameObjects.Container;
  private tooltipBg!: Phaser.GameObjects.Graphics;
  private tooltipName!: Phaser.GameObjects.Text;
  private tooltipRarity!: Phaser.GameObjects.Text;
  private tooltipStats!: Phaser.GameObjects.Text;

  // Gold display
  private goldText!: Phaser.GameObjects.Text;

  // Drag state
  private dragItem: ItemInstance | null = null;
  private dragFromSlot: number = -1;
  private dragSprite: Phaser.GameObjects.Graphics | null = null;

  // Callbacks
  private onMoveItem?: (fromSlot: number, toSlot: number) => void;
  private onEquipItem?: (itemSlot: number, equipSlot: EquipmentSlot) => void;
  private onUnequipItem?: (equipSlot: EquipmentSlot) => void;
  private onUseItem?: (slot: number) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(110);
    this.container.setVisible(false);

    this.createPanel();
    this.createTooltip();
  }

  // ─── Public API ───────────────────────────────────────────

  toggle(): void {
    this.visible = !this.visible;
    this.container.setVisible(this.visible);
    if (!this.visible) this.hideTooltip();
  }

  show(): void {
    this.visible = true;
    this.container.setVisible(true);
  }

  hide(): void {
    this.visible = false;
    this.container.setVisible(false);
    this.hideTooltip();
  }

  isVisible(): boolean {
    return this.visible;
  }

  updateInventory(slots: { index: number; item: ItemInstance | null }[]): void {
    for (const slot of slots) {
      this.slotItems[slot.index] = slot.item;
      this.drawSlot(slot.index);
    }
  }

  updateEquipment(slot: EquipmentSlot, item: ItemInstance | null): void {
    if (item) {
      this.equipItems.set(slot, item);
    } else {
      this.equipItems.delete(slot);
    }
    this.drawEquipSlot(slot);
  }

  updateGold(gold: number): void {
    this.goldText.setText(`💰 ${gold.toLocaleString()}`);
  }

  setCallbacks(opts: {
    onMoveItem?: (fromSlot: number, toSlot: number) => void;
    onEquipItem?: (itemSlot: number, equipSlot: EquipmentSlot) => void;
    onUnequipItem?: (equipSlot: EquipmentSlot) => void;
    onUseItem?: (slot: number) => void;
  }): void {
    this.onMoveItem = opts.onMoveItem;
    this.onEquipItem = opts.onEquipItem;
    this.onUnequipItem = opts.onUnequipItem;
    this.onUseItem = opts.onUseItem;
  }

  // ─── Panel Creation ───────────────────────────────────────

  private createPanel(): void {
    const panelWidth = COLS * (SLOT_SIZE + SLOT_GAP) + PANEL_PADDING * 2 + 180;
    const panelHeight = Math.max(
      ROWS * (SLOT_SIZE + SLOT_GAP) + PANEL_PADDING * 2 + 40,
      360
    );
    const px = (GAME_CONFIG.VIEWPORT_WIDTH - panelWidth) / 2;
    const py = (GAME_CONFIG.VIEWPORT_HEIGHT - panelHeight) / 2;

    // Background
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x111122, 0.95);
    bg.fillRoundedRect(px, py, panelWidth, panelHeight, 8);
    bg.lineStyle(2, 0x444466);
    bg.strokeRoundedRect(px, py, panelWidth, panelHeight, 8);
    bg.setScrollFactor(0);
    this.container.add(bg);

    // Title
    const title = this.scene.add.text(px + panelWidth / 2, py + 8, 'Inventory', {
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      color: '#c0a040',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0).setScrollFactor(0);
    this.container.add(title);

    // Close button
    const closeBtn = this.scene.add.text(px + panelWidth - 14, py + 6, '✕', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      color: '#cc4444',
    }).setOrigin(1, 0).setScrollFactor(0).setInteractive({ useHandCursor: true });
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);

    // ── Inventory Grid ──────────────────────────────────────
    const gridX = px + PANEL_PADDING;
    const gridY = py + 32;

    for (let i = 0; i < GAME_CONFIG.INVENTORY_SLOTS; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = gridX + col * (SLOT_SIZE + SLOT_GAP);
      const y = gridY + row * (SLOT_SIZE + SLOT_GAP);

      const slotGfx = this.createSlotGraphics(x, y, SLOT_SIZE, i);
      this.slotGraphics.push(slotGfx);

      // Interaction
      slotGfx.hitArea.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.handleSlotClick(i, pointer);
      });
      slotGfx.hitArea.on('pointerover', () => {
        this.showItemTooltip(i);
      });
      slotGfx.hitArea.on('pointerout', () => {
        this.hideTooltip();
      });
    }

    // ── Equipment Paper Doll ─────────────────────────────────
    const equipX = gridX + COLS * (SLOT_SIZE + SLOT_GAP) + 20;
    const equipY = gridY + 20;

    const equipTitle = this.scene.add.text(equipX + 60, equipY - 10, 'Equipment', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#8888aa',
    }).setOrigin(0.5, 0).setScrollFactor(0);
    this.container.add(equipTitle);

    const equipSlots: { slot: EquipmentSlot; label: string; x: number; y: number }[] = [
      { slot: EquipmentSlot.HEAD, label: 'Head', x: 40, y: 0 },
      { slot: EquipmentSlot.SHOULDERS, label: 'Should', x: 0, y: 28 },
      { slot: EquipmentSlot.CHEST, label: 'Chest', x: 40, y: 50 },
      { slot: EquipmentSlot.HANDS, label: 'Hands', x: 80, y: 28 },
      { slot: EquipmentSlot.LEGS, label: 'Legs', x: 40, y: 90 },
      { slot: EquipmentSlot.FEET, label: 'Feet', x: 40, y: 130 },
      { slot: EquipmentSlot.MAIN_HAND, label: 'MH', x: -20, y: 70 },
      { slot: EquipmentSlot.OFF_HAND, label: 'OH', x: 100, y: 70 },
      { slot: EquipmentSlot.RING_1, label: 'Ring1', x: -20, y: 130 },
      { slot: EquipmentSlot.RING_2, label: 'Ring2', x: 100, y: 130 },
      { slot: EquipmentSlot.NECKLACE, label: 'Neck', x: 0, y: 0 },
      { slot: EquipmentSlot.TRINKET, label: 'Trink', x: 80, y: 0 },
    ];

    for (const eq of equipSlots) {
      const x = equipX + eq.x;
      const y = equipY + eq.y;
      const slotGfx = this.createSlotGraphics(x, y, EQUIP_SLOT_SIZE, -1);

      // Label
      const label = this.scene.add.text(
        x + EQUIP_SLOT_SIZE / 2, y + EQUIP_SLOT_SIZE + 2, eq.label, {
          fontFamily: 'Arial, sans-serif',
          fontSize: '8px',
          color: '#6666aa',
        }
      ).setOrigin(0.5, 0).setScrollFactor(0);
      this.container.add(label);

      this.equipSlotGraphics.set(eq.slot, slotGfx);

      slotGfx.hitArea.on('pointerdown', () => {
        this.handleEquipSlotClick(eq.slot);
      });
    }

    // ── Gold Display ────────────────────────────────────────
    this.goldText = this.scene.add.text(gridX, gridY + ROWS * (SLOT_SIZE + SLOT_GAP) + 10, '💰 0', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#ccaa33',
    }).setScrollFactor(0);
    this.container.add(this.goldText);
  }

  private createSlotGraphics(x: number, y: number, size: number, _slotIndex: number): SlotGraphics {
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x1a1a2e, 0.9);
    bg.fillRoundedRect(x, y, size, size, 4);
    bg.lineStyle(1, 0x444466);
    bg.strokeRoundedRect(x, y, size, size, 4);
    bg.setScrollFactor(0);
    this.container.add(bg);

    const hitArea = this.scene.add.rectangle(
      x + size / 2, y + size / 2, size, size
    ).setScrollFactor(0).setInteractive({ useHandCursor: true }).setAlpha(0.001);
    this.container.add(hitArea);

    const itemGfx = this.scene.add.graphics();
    itemGfx.setScrollFactor(0);
    this.container.add(itemGfx);

    const itemText = this.scene.add.text(x + size / 2, y + size / 2, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#ffffff',
    }).setOrigin(0.5).setScrollFactor(0);
    this.container.add(itemText);

    const qtyText = this.scene.add.text(x + size - 3, y + size - 3, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '9px',
      color: '#ccccaa',
    }).setOrigin(1, 1).setScrollFactor(0);
    this.container.add(qtyText);

    return { bg, hitArea, itemGfx, itemText, qtyText, x, y, size };
  }

  // ─── Drawing ──────────────────────────────────────────────

  private drawSlot(index: number): void {
    const gfx = this.slotGraphics[index];
    if (!gfx) return;

    const item = this.slotItems[index];

    gfx.itemGfx.clear();
    gfx.itemText.setText('');
    gfx.qtyText?.setText('');

    if (!item) return;

    // Draw item icon placeholder (colored square by rarity)
    const rarityColor = parseInt(RARITY_COLORS[item.rarity ?? ItemRarity.COMMON].replace('#', ''), 16);
    gfx.itemGfx.fillStyle(rarityColor, 0.8);
    gfx.itemGfx.fillRoundedRect(gfx.x + 4, gfx.y + 4, gfx.size - 8, gfx.size - 8, 3);

    // Item name abbreviated
    const shortName = (item.item_id ?? '').slice(0, 4);
    gfx.itemText.setText(shortName);

    // Quantity
    if (item.quantity > 1) {
      gfx.qtyText?.setText(String(item.quantity));
    }
  }

  private drawEquipSlot(slot: EquipmentSlot): void {
    const gfx = this.equipSlotGraphics.get(slot);
    if (!gfx) return;

    const item = this.equipItems.get(slot);

    gfx.itemGfx.clear();
    gfx.itemText.setText('');

    if (!item) return;

    const rarityColor = parseInt(RARITY_COLORS[item.rarity ?? ItemRarity.COMMON].replace('#', ''), 16);
    gfx.itemGfx.fillStyle(rarityColor, 0.8);
    gfx.itemGfx.fillRoundedRect(gfx.x + 4, gfx.y + 4, gfx.size - 8, gfx.size - 8, 3);
  }

  // ─── Interaction ──────────────────────────────────────────

  private handleSlotClick(slotIndex: number, pointer: Phaser.Input.Pointer): void {
    const item = this.slotItems[slotIndex];

    if (this.dragItem) {
      // Dropping
      if (this.dragFromSlot >= 0) {
        this.onMoveItem?.(this.dragFromSlot, slotIndex);
      }
      this.cancelDrag();
    } else if (item) {
      // Start drag (left click) or use (right click)
      if (pointer.rightButtonDown()) {
        // Right-click: try to equip or use
        this.onUseItem?.(slotIndex);
      } else {
        this.startDrag(item, slotIndex);
      }
    }
  }

  private handleEquipSlotClick(slot: EquipmentSlot): void {
    if (this.equipItems.has(slot)) {
      this.onUnequipItem?.(slot);
    }
  }

  private startDrag(item: ItemInstance, fromSlot: number): void {
    this.dragItem = item;
    this.dragFromSlot = fromSlot;

    // Visual drag indicator
    this.dragSprite = this.scene.add.graphics();
    const rarityColor = parseInt(RARITY_COLORS[item.rarity ?? ItemRarity.COMMON].replace('#', ''), 16);
    this.dragSprite.fillStyle(rarityColor, 0.7);
    this.dragSprite.fillRoundedRect(-SLOT_SIZE / 2, -SLOT_SIZE / 2, SLOT_SIZE, SLOT_SIZE, 4);
    this.dragSprite.setScrollFactor(0).setDepth(200);

    this.scene.input.on('pointermove', this.onDragMove, this);
    this.scene.input.once('pointerup', this.onDragEnd, this);
  }

  private onDragMove(pointer: Phaser.Input.Pointer): void {
    if (this.dragSprite) {
      this.dragSprite.setPosition(pointer.x, pointer.y);
    }
  }

  private onDragEnd(): void {
    this.cancelDrag();
  }

  private cancelDrag(): void {
    this.dragItem = null;
    this.dragFromSlot = -1;
    if (this.dragSprite) {
      this.dragSprite.destroy();
      this.dragSprite = null;
    }
    this.scene.input.off('pointermove', this.onDragMove, this);
  }

  // ─── Tooltip ──────────────────────────────────────────────

  private createTooltip(): void {
    this.tooltipContainer = this.scene.add.container(0, 0);
    this.tooltipContainer.setScrollFactor(0).setDepth(200).setVisible(false);
    this.container.add(this.tooltipContainer);

    this.tooltipBg = this.scene.add.graphics();
    this.tooltipContainer.add(this.tooltipBg);

    this.tooltipName = this.scene.add.text(8, 6, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.tooltipContainer.add(this.tooltipName);

    this.tooltipRarity = this.scene.add.text(8, 24, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#aaaaaa',
    });
    this.tooltipContainer.add(this.tooltipRarity);

    this.tooltipStats = this.scene.add.text(8, 40, '', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '10px',
      color: '#cccccc',
      wordWrap: { width: 180 },
    });
    this.tooltipContainer.add(this.tooltipStats);
  }

  private showItemTooltip(slotIndex: number): void {
    const item = this.slotItems[slotIndex];
    if (!item) return;

    const rarityColor = RARITY_COLORS[item.rarity ?? ItemRarity.COMMON];
    this.tooltipName.setText(item.item_id ?? 'Unknown');
    this.tooltipName.setColor(rarityColor);
    this.tooltipRarity.setText((item.rarity ?? 'common').toUpperCase());

    // Stats
    const stats: string[] = [];
    if (item.durability !== undefined && item.max_durability !== undefined) {
      stats.push(`Durability: ${item.durability}/${item.max_durability}`);
    }
    if (item.enchantments && item.enchantments.length > 0) {
      for (const ench of item.enchantments) {
        stats.push(`+${ench.value} ${ench.stat}`);
      }
    }
    this.tooltipStats.setText(stats.join('\n') || 'No stats');

    // Position tooltip near the slot
    const gfx = this.slotGraphics[slotIndex];
    if (gfx) {
      this.tooltipContainer.setPosition(gfx.x + SLOT_SIZE + 8, gfx.y);
    }

    // Resize bg
    const h = 48 + (stats.length * 14);
    this.tooltipBg.clear();
    this.tooltipBg.fillStyle(0x111122, 0.95);
    this.tooltipBg.fillRoundedRect(0, 0, 200, h, 4);
    this.tooltipBg.lineStyle(1, 0x555577);
    this.tooltipBg.strokeRoundedRect(0, 0, 200, h, 4);

    this.tooltipContainer.setVisible(true);
  }

  private hideTooltip(): void {
    this.tooltipContainer.setVisible(false);
  }

  destroy(): void {
    this.cancelDrag();
    this.container.destroy();
  }
}
