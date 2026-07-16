# NEXUS REALMS — Game Design Document

**Version:** 1.0.0
**Date:** 2026-07-16
**Classification:** Internal — Production Ready
**Engine:** Web-Based (HTML5 Canvas / WebGL 2.0)
**Platform:** Browser (Chrome, Firefox, Safari, Edge) + Desktop PWA

---

## Table of Contents

1. [World & Lore](#1-world--lore)
2. [Classes](#2-classes)
3. [Skill Trees](#3-skill-trees)
4. [Professions](#4-professions)
5. [Economy](#5-economy)
6. [PvE Systems](#6-pve-systems)
7. [PvP Systems](#7-pvp-systems)
8. [Guild Systems](#8-guild-systems)
9. [Mounts & Housing](#9-mounts--housing)
10. [Quest Design](#10-quest-design)
11. [NPC Ecosystem](#11-npc-ecosystem)
12. [UI/UX Design](#12-uiux-design)
13. [Accessibility](#13-accessibility)
14. [Monetization](#14-monetization)
15. [Live Service](#15-live-service)

---

# 1. WORLD & LORE

## 1.1 Creation Myth & Cosmology

### The Void and the First Light

Before time had meaning, there was only **The Void** — an infinite expanse of nothingness. Within The Void, two primordial forces existed in dormant opposition: **Aether** (creation, order, energy) and **Nihil** (entropy, chaos, dissolution).

The cosmological event known as **The First Spark** occurred when Aether and Nihil collided at a single point, birthing the **Nexus Core** — a crystalline sphere of infinite energy that became the heart of all creation. From the Nexus Core, seven **Primordial Shards** radiated outward, each embodying a fundamental aspect of reality:

| Shard | Domain | Material Form | Current Location |
|-------|--------|---------------|-----------------|
| Shard of Life | Growth, healing, nature | Emerald crystal | The Evergrove (Region 1) |
| Shard of Flame | Destruction, passion, energy | Ruby crystal | The Cinderlands (Region 2) |
| Shard of Tide | Flow, change, adaptation | Sapphire crystal | The Abyssal Reach (Region 3) |
| Shard of Stone | Endurance, structure, earth | Topaz crystal | The Ironspine Peaks (Region 4) |
| Shard of Wind | Freedom, movement, sky | Diamond crystal | The Skyward Expanse (Region 5) |
| Shard of Shadow | Mystery, death, secrets | Amethyst crystal | The Umbral Depths (Region 6) |
| Shard of Mind | Knowledge, consciousness, magic | Opal crystal | The Nexus Sanctum (Center) |

### The Titan Epoch

The Primordial Shards gave birth to the **Titans** — seven colossal beings who shaped the world of **Aethermere** from raw void-matter. Each Titan molded their domain according to their shard's nature:

- **Verdanthus** (Life) — Grew the first forests, spawned the first creatures
- **Pyralis** (Flame) — Forged the planet's molten core, created volcanoes and deserts
- **Thalassor** (Tide) — Carved the oceans, rivers, and weather systems
- **Granitus** (Stone) — Raised the mountains, laid the bedrock
- **Zephyria** (Wind) — Created the atmosphere, the sky, and the currents
- **Nocturna** (Shadow) — Wove the cycle of death and rebirth, created the spirit realm
- **Luminaris** (Mind) — Bestowed consciousness upon the first mortals, created magic

The Titans departed Aethermere after their work was complete, leaving the Shards embedded in the world. Their departure — called **The Ascension** — left behind Titan Constructs: ancient mechanical guardians that still protect the Shard locations.

### The Mortal Ages

| Age | Duration | Key Events |
|-----|----------|------------|
| Age of Awakening | ~2000 years | First mortal races discover the Shards, primitive civilizations form |
| Age of Harmony | ~1500 years | Races cooperate, first cities built, magic is learned |
| Age of Schism | ~800 years | Faction wars erupt over Shard control, great empires rise and fall |
| Age of Cataclysm | ~300 years | The Sundering — a catastrophic magical event fractures the world |
| Age of Fracture | ~500 years (current) | Six isolated regions struggle to survive, the Nexus Core grows unstable |

### The Sundering (World-Shaping Event)

Three hundred years ago, an ambitious archmage named **Valdris Kael** attempted to channel all seven Shards simultaneously through the Nexus Core to achieve godhood. The resulting magical explosion — **The Sundering** — did three things:

1. **Fractured the continental landmass** into six distinct regions separated by magical barriers called the **Veil Walls**
2. **Corrupted the Nexus Core**, causing it to leak unstable energy (called **Aetherstorms**) across the world
3. **Opened rifts** to the **Void Realm**, allowing Nihil-tainted creatures (**The Hollow**) to invade

The Veil Walls are semi-permeable: mortals can pass through with effort, but The Hollow cannot cross freely. This has kept each region isolated but also prevented coordinated defense.

### Current Era — The Age of Fracture

The game begins 300 years after The Sundering. The Nexus Core is destabilizing further. Aetherstorms are becoming more frequent and powerful. The Hollow are finding ways through the Veil Walls. Ancient Titan Constructs are reactivating — some hostile, some seeking mortal aid.

The central narrative question: **Can the six regions reunite, stabilize the Nexus Core, and push back The Hollow before Aethermere is consumed by the Void?**

---

## 1.2 The World of Aethermere

### Geography Overview

Aethermere is a roughly spherical planet slightly larger than Earth (~1.3x diameter). The Nexus Core sits at the planet's magical north pole, surrounded by the **Nexus Sanctum** — a neutral zone accessible from all six regions via Veil Wall portals.

The six regions are arranged in a rough ring around the Nexus Sanctum, each separated by Veil Walls. Between the regions lie the **Shattered Expanse** — unstable zones of floating islands and reality distortions caused by The Sundering.

### Global Mechanics

- **Aetherstorms**: Random world events that distort reality in affected zones — altered gravity, shifted terrain, spawned enemies, bonus resources
- **Veil Crossings**: Permanent portals between regions, unlocked through main story progression
- **The Convergence**: A weekly event where Veil Walls weaken, allowing enhanced cross-region travel and enabling rare cross-region content

---

## 1.3 The Six Regions

### Region 1: THE EVERGROVE — Land of Living Green

**Biome:** Temperate rainforest, ancient woodland, crystalline rivers, floating islands of vegetation
**Dominant Race:** Elves (Sylvanni) and Firbolgs
**Shard:** Life (Verdanthus)
**Climate:** Perpetual spring with bioluminescent nights
**Threat Level:** 1–25 (starting region)

**Lore:** The Evergrove is the most verdant region of Aethermere, where the Shard of Life pulses with such power that plants grow sentient, rivers flow upward, and the forest itself is a living entity called **The Verdance**. The Sylvanni Elves have lived in symbiosis with The Verdance for millennia, their cities grown rather than built.

**Key Environmental Mechanics:**
- **Overgrowth Zones**: Areas where rapid plant growth blocks paths on a rotating schedule
- **Living Terrain**: The ground shifts — roots become bridges, trees relocate
- **Aetherbloom Events**: Magical flowers bloom at specific times, granting temporary buffs or opening hidden areas
- **Toxic Spore Clouds**: Certain areas emit poisonous spores requiring protective items or abilities

#### Major Cities

**1. Sylvaran, The Canopy Capital**
- **Population:** ~45,000
- **Description:** A massive city built across the upper canopy of three interconnected World Trees. Bridges of living vine connect platforms hundreds of feet above the forest floor. The city glows with bioluminescent moss at night.
- **Services:**
  - **The Emerald Market**: Central trading hub, auction house access
  - **Verdant Forge**: Crafting stations for all professions (lower level)
  - **The Athenaeum**: Lore library, quest journal management
  - **Groveheart Inn**: Rest XP bonus, player mail, social hub
  - **Hall of the Leafblade**: Warrior and Ranger class trainers
  - **The Prismatic Sanctum**: Mage and Healer class trainers
  - **Sylvaran Bank**: Shared storage vaults
- **Key NPCs:**
  - **Archdruidess Aelindra** (Main Story Quest giver) — The aging leader of the Sylvanni, who first sensed the Nexus Core destabilizing
  - **Fenwick Rootwhistle** (Firbolg merchant) — Sells rare herbalism supplies and buys gathered herbs at 15% premium
  - **Kael'thas Moonbow** (Ranger trainer) — Grizzled veteran who teaches the Ranger class
  - **Sister Lirael** (Healer trainer) — Priestess of Verdanthus who trains Clerics
  - **Grumblethorn** (Grumpy Treant) — Unusual NPC who offers daily gathering quests and occasionally drops lore hints

**2. Mosshollow Glen**
- **Population:** ~12,000
- **Description:** A cozy village built inside a hollowed-out mega-fungus. Known for its alchemy school and rare mushroom cultivation.
- **Services:** Alchemy trainer, herbalism trainer, rare reagent vendor, cooking supplies
- **Key NPCs:**
  - **Mycelia** (Alchemy trainer) — A sentient mushroom-person who communicates through spore patterns
  - **Old Barkley** (Herbalism trainer) — Retired adventurer who knows every plant in the Evergrove

**3. Crystalveil Springs**
- **Population:** ~8,000
- **Description:** A spa-town built around magical hot springs with restorative properties. Functions as a rest hub with enhanced XP bonuses.
- **Services:** Enchanting trainer, resting XP bonus zone, fishing trainer, cosmetic vendor
- **Key NPCs:**
  - **The Spring Oracle** — Mysterious NPC who offers cryptic prophecies that serve as hints for hidden quests
  - **Captain Ripples** (Fishing trainer) — A cheerful water elemental bound in mortal form

#### Dungeons (The Evergrove)

**1. The Root Labyrinth (Level 5–8, Normal)**
- **Theme:** Underground maze beneath a corrupted World Tree
- **Bosses:** 3
- **Mechanics:**
  - *Boss 1 — Rootmaw*: A giant corrupted root worm. Tank must position it away from healing roots (green circles that heal the boss). DPS must destroy root tendrils that spawn adds every 30 seconds. Rootmaw does a cone attack (Sundering Slam) that reduces armor by 20% for 15s, stacking up to 5 times.
  - *Boss 2 — The Spore Twins (Lumis and Noxis)*: Two mushroom bosses that must die within 10 seconds of each other or they resurrect. Lumis heals; Noxis does AoE poison. Players must split into two groups. If Lumis reaches 30% HP, she casts Photosynthesis (heals to full if not interrupted). If Noxis reaches 30%, he casts Spore Explosion (massive AoE, must LoS behind mushroom pillars).
  - *Boss 3 — Ancient Barkheart*: A corrupted treant guardian. Phase 1: Tank and spank. Phase 2 (50% HP): Roots erupt from ground in patterns — players must navigate safe zones. Phase 3 (25% HP): Barkheart splits into three smaller treants — all must die simultaneously or they merge back at 50% HP.
- **Loot Table:** Evergrove Sentinel set (uncommon), Mossy weapons, rare chance at Barkheart's Shield (blue quality tank shield)

**2. The Bioluminescent Caverns (Level 10–13, Normal)**
- **Theme:** Deep underground cave system filled with glowing fungi and crystal formations
- **Bosses:** 4
- **Mechanics:**
  - *Boss 1 — Crystal Golem Shardback*: Reflects magic damage when its crystal shell is active (glows blue). Physical DPS must break the shell, then magic DPS can burst. Shell regenerates every 45 seconds.
  - *Boss 2 — The Lurelight*: A deep-sea anglerfish-like creature adapted to caves. Its lure mesmerizes the nearest player (2s stun, walks toward boss). Mesmerized player must be freed by allies attacking the lure. Periodically plunges the room into darkness — players must find glowing crystals to stand near.
  - *Boss 3 — Mycelial Network*: Not a single boss but the entire room. Players must destroy 8 fungal nodes while waves of spore-creatures attack. Each destroyed node reduces the room's poison damage. If all 8 are alive simultaneously, the room wipes with Toxic Overload.
  - *Boss 4 — Lumina, the Crystal Queen*: A crystallized dryad. Phase 1: Shoots crystal shards in line patterns. Phase 2 (60%): Encases one random player in crystal — others must DPS the crystal down within 10s or the player dies. Phase 3 (30%): The floor becomes crystals — players must jump between platforms while dodging falling stalactites.
- **Loot Table:** Crystalweave set (uncommon), Glowing Crystal weapons, rare Lumina's Pendant (blue quality DPS trinket)

**3. The Verdant Spire (Level 15–18, Normal)**
- **Theme:** Vertical ascent up a living tower of intertwined plants
- **Bosses:** 4
- **Mechanics:** Ascending encounter — each boss fought on a different tier. Falling off the platform = death. The tower "grows" during combat, creating new hazards. Inter-boss trash involves vine-pulling puzzles and spore-cloud navigation.
  - *Boss 1 — Thorn Guardian*: Melee-heavy boss with a thorn aura that damages attackers. Ranged DPS preferred. Periodically launches thorn volleys at random players (dodge or take bleed damage).
  - *Boss 2 — Pollen Cloud Elemental*: An air-based boss. Fans of pollen that must be blown away by wind mechanics (environmental fan objects). Tank must position boss near fans. DPS activate fans during pollen casts.
  - *Boss 3 — Vine Colossus*: A massive vine creature that wraps around the spire. Players must DPS vine segments while avoiding crushing attacks. Each segment destroyed causes the boss to change attack patterns.
  - *Boss 4 — The Verdant Avatar*: Manifestation of corrupted nature magic. Constantly heals from the spire below — players must destroy healing roots during the fight. Uses all previous boss mechanics in rotation during Phase 2.
- **Loot Table:** Spire Warden set (rare), Nature's Embrace staff (rare), chance at Sylvanni Crown (epic head piece)

**4. Eldergrove Sanctuary (Level 20–23, Heroic)**
- **Theme:** Ancient temple to Verdanthus, now corrupted by Void energy
- **Bosses:** 5
- **Mechanics:** Introduces Heroic-level mechanics — tighter DPS checks, complex positioning, multi-phase fights with environmental hazards.
  - *Boss 1 — Corrupted Grove Keeper*: Has a Void Shield that absorbs damage. Shield can only be broken by luring it into Life Wells (green circles that counteract Void energy). Two Life Wells active at once — boss avoids them, so tank must kite strategically.
  - *Boss 2 — Twin Sentinels (Life and Void)*: Two bosses sharing a health pool. Damage to one heals the other. Strategy: burst one down during vulnerability windows when they swap (every 60s).
  - *Boss 3 — The Dreamer*: A sleeping ancient being. Players enter a "dream realm" — a mirrored version of the room with different mechanics. Must defeat dream-adds to wake the boss, then DPS during a 15s window before it sleeps again (3 cycles).
  - *Boss 4 — Archdruid Malachar*: A fallen Sylvanni archdruid. Intelligent boss that targets healers, interrupts casting, and summons corrupted treant adds. Has a "Nature's Wrath" mechanic that spawns tracking vines — kiting required.
  - *Boss 5 — The Blight Seed*: A Void-corrupted seed of Verdanthus. Room-wide mechanics: the floor alternates between Life zones (healing) and Void zones (damage). Boss periodically "blooms" — all Void zones become Life and vice versa. Players must manage positioning while DPSing.
- **Loot Table:** Eldergrove Purifier set (rare), Verdanthus Fragment (crafting material for epic items), chance at Shard of Life replica (epic trinket)

**5. Heart of The Verdance (Level 25, Mythic Raid Dungeon)**
- **Theme:** The living core of the Evergrove forest itself, accessed only during The Convergence
- **Bosses:** 6
- **Mechanics:** 10-man content. Introduces mythic-only mechanics and coordination requirements.
  - *Boss 1 — The Verdant Colossus*: A tree-creature the size of a building. Requires two tanks — one holds the body, one handles spawned root-tendrils. DPS must target glowing weak points that shift every 20s. Healers deal with a "Photosynthesis" debuff that reverses healing (heals become damage, damage becomes heals) for 10s intervals.
  - *Boss 2 — Ancient of Lore*: An intelligent treant boss that uses player abilities against them. Copies the highest-DPS player's rotation with 50% effectiveness. Players must coordinate to use their weakest abilities during certain phases.
  - *Boss 3 — The Corruption*: A spreading Void blight that consumes the arena. Players must DPS blight nodes while keeping a central Life Crystal alive. The crystal heals nearby players but is targeted by Void adds. 4 teams of 2-3 players each handle cardinal directions.
  - *Boss 4 — Spirit of Verdanthus (Corrupted)*: A fragment of the Life Titan. Phase 1: Pure nature damage — heavy AoE healing required. Phase 2: Corrupted — switches to Void damage, requiring different resistance. Phase 3: Alternates every 15s. Players must track the Titan's "mood" indicator.
  - *Boss 5 — Aelindra's Shadow*: A Void-clone of the main story NPC. Uses a mix of all class abilities. Adaptively targets the weakest link in the party. Has an enrage timer of 8 minutes.
  - *Boss 6 — The Nexus Seed*: The encounter is a race. The Seed is "hatching" into a Void entity. Players must deal enough damage in 5 minutes while managing waves of adds, environmental hazards (falling branches, spreading corruption), and a puzzle mechanic where players must channel Life energy into pillars in the correct order (randomized each attempt).
- **Loot Table:** Mythic Evergrove set (epic), Heart of Verdance (legendary crafting material), chance at Verdanthus' Echo (legendary trinket — 0.5% drop rate)

#### World Bosses (The Evergrove)

**1. Ancient Wyrmwood** (Level 20, Open World)
- A colossal corrupted dragon fused with a World Tree. Spawns every 6 hours in the northern Evergrove.
- Requires 15–20 players. Drops rare crafting materials, a mount (Emerald Wyrmling, 2% drop rate), and Evergrove-themed gear.

**2. The Rotmother** (Level 25, Open World)
- A fungal horror that corrupts entire zones when she spawns. Spawns randomly in one of three locations.
- Requires 20–25 players. Has a unique mechanic where players who die become "infected" and must be cleansed by healers or they become hostile adds.

---

### Region 2: THE CINDERLANDS — Realm of Ash and Ember

**Biome:** Volcanic wasteland, obsidian deserts, lava rivers, ember forests (trees made of cooling magma), floating ash storms
**Dominant Race:** Dwarves (Forged) and Salamanders
**Shard:** Flame (Pyralis)
**Climate:** Extreme heat, ash fall, periodic eruption events
**Threat Level:** 15–35

**Lore:** The Cinderlands were once a temperate plain before The Sundering activated the Shard of Flame, turning the region into a volcanic hellscape. The Forged Dwarves — a clan of dwarves who embraced the flame — thrive here, using the geothermal energy for their legendary forges. The Salamanders, a race of fire-resistant humanoids, are native to this region and have a complex tribal society.

**Key Environmental Mechanics:**
- **Lava Tides**: Lava flows shift on a schedule, opening and closing paths
- **Ash Storms**: Reduce visibility and apply a stacking fire DoT; require shelter or fire resistance
- **Heat Zones**: Areas of extreme heat that drain health over time without fire resistance gear/buffs
- **Eruption Events**: Random volcanic eruptions that reshape terrain and spawn rare resources

#### Major Cities

**1. Forgeheart, The Eternal Furnace**
- **Population:** ~55,000
- **Description:** Built inside a dormant volcano, Forgeheart is the crafting capital of Aethermere. The city's center is a massive forge powered by a controlled lava flow. The heat is regulated by ancient Dwarven cooling runes.
- **Services:** Master-level crafting trainers, Blacksmithing specialty shops, Mining trainers, Enchanting trainers, the Grand Forge (unique crafting station with +15% quality bonus), Auction House, Bank
- **Key NPCs:**
  - **Forge-King Thorgrim Ironbeard** (Main Story) — Ruler of the Forged Dwarves, seeks alliance against the Cinderlands' growing threats
  - **Emberheart** (Salamander merchant) — Sells fire-resistant gear and rare volcanic materials
  - **Master Smith Hilda Stonehammer** — Blacksmithing trainer, offers unique recipes at max reputation

**2. Ashwalker Camp**
- **Population:** ~5,000
- **Description:** A nomadic Salamander settlement that moves with the lava tides. Built on obsidian platforms carried by tamed magma beasts.
- **Services:** Skinning trainer, Alchemy trainer (fire specialization), survival gear vendor
- **Key NPCs:**
  - **Chieftain Solara** — Salamander leader who can become a powerful ally or enemy based on player choices
  - **Embertongue** (Alchemy trainer) — Teaches fire-resistant potion crafting

**3. Cindershield Bastion**
- **Population:** ~20,000
- **Description:** A fortified Dwarven outpost guarding the Cinderlands' eastern border against Hollow incursions. Built from obsidian and enchanted steel.
- **Services:** PvP vendors, gear repair, daily quest hub, dungeon entrance hub
- **Key NPCs:**
  - **Commander Durak Ashborne** — Military leader who offers daily kill quests and faction reputation
  - **Quartermaster Sven** — Sells gear upgrades for reputation tokens

#### Dungeons (The Cinderlands)

**1. The Obsidian Foundry (Level 16–19, Normal)**
- **Theme:** An abandoned Dwarven forge complex overrun by fire elementals
- **Bosses:** 4
- **Mechanics:**
  - *Boss 1 — Slag Golem*: A creature of molten metal. Leaves fire trails behind it — tank must kite in circles. Periodically "cools" (becomes immune to damage for 10s) then "heats" (takes 50% more damage for 15s). DPS must burst during heated phase.
  - *Boss 2 — The Forge Master*: A corrupted Dwarven smith. Hammers create shockwaves (line AoE). Creates fire zones by plunging hammer into the ground. Adds spawn from the forge — must be CC'd or killed before they reach the boss (they heal him).
  - *Boss 3 — Magma Hydra*: Three-headed hydra. Each head targets a different role (tank, DPS, healer). Destroying a head causes the other two to enrage. Strategy: bring all three to low HP, then kill within 5 seconds of each other.
  - *Boss 4 — Pyralis Fragment*: A shard of the Flame Titan's essence. The room fills with rising lava — players must DPS the fragment before the lava reaches the platform. Fragment creates fire tornadoes that must be dodged. At 50% HP, lava recedes briefly, then rises faster in Phase 2.
- **Loot Table:** Obsidian Forged set (uncommon), Magma weapons, Forge Master's Hammer (rare 2H mace)

**2. The Ashen Depths (Level 20–23, Normal)**
- **Theme:** Deep underground caverns where ancient magma has solidified into tunnels
- **Bosses:** 4
- **Mechanics:**
  - *Boss 1 — Ember Colossus*: Steps cause shockwaves. Players must jump at the right moment. When it slams both fists, the ceiling collapses in spots — dodge or die.
  - *Boss 2 — Ash Wraiths (x3)*: Three ghostly entities. Each can only be damaged by a specific damage type (physical, fire, arcane). Players must swap targets. They periodically merge into one super-wraith for 15s — must survive.
  - *Boss 3 — The Pressure Valve*: A mechanical Dwarven device that's malfunctioning. Players must complete a rotation puzzle (activate levers in correct order) while defending against waves of constructs. The "boss" is the room itself — failure to solve the puzzle in time causes a steam explosion (wipe).
  - *Boss 4 — Cinder Dragon Hatchling*: A baby dragon in a massive cavern. Flies around doing strafing runs — players must use cover. Lands periodically for melee DPS. At 30% HP, breathes a cone of fire that covers 60% of the room — must get behind it.
- **Loot Table:** Ashwalker set (uncommon), Cinder weapons, Dragon Scale Cloak (rare back piece)

**3. The Crucible of Souls (Level 25–28, Heroic)**
- **Theme:** A Void-corrupted forge where souls are being weaponized
- **Bosses:** 5
- **Mechanics:**
  - *Boss 1 — Soul Forgemaster*: Imprisoned souls in the room can be freed (clicking chains) to provide buffs or left to be absorbed by the boss (making him stronger). Risk/reward mechanic.
  - *Boss 2 — The Twin Hammers*: Two massive automatons that synchronize attacks. When close together, they gain a damage buff. When far apart, they cast ranged attacks. Optimal strategy requires precise positioning.
  - *Boss 3 — Void Flame Elemental*: Alternates between fire and void damage phases. Fire phase: stack and heal. Void phase: spread and dodge void zones. Transition between phases is telegraphed but fast.
  - *Boss 4 — The Prisoner*: An ancient being chained in the deepest forge. Breaks free during the fight. Uses massive AoE attacks. Players must re-chain it by activating 4 chain-points simultaneously (requires 4 players clicking at the same time, twice during the fight).
  - *Boss 5 — Crucible Heart*: The forge itself. A DPS race against the forge's completion timer. Adds spawn from four conveyor belts. Players must choose: kill adds (preventing boss empowerment) or DPS the boss (racing the timer). Optimal strategy involves rotating DPS assignments.
- **Loot Table:** Crucible Forged set (rare), Soul-Forged weapons (rare), chance at Pyralis Shard (epic crafting material)

**4. Mount Pyralis (Level 30–33, Heroic)**
- **Theme:** Ascending an active volcano to reach the Shard of Flame
- **Bosses:** 5
- **Mechanics:** Vertical dungeon with increasing heat. Heat stacks build over time, requiring cooling stations (mushroom vents, water pools) or fire resistance. Falling into lava = instant death.
  - *Boss 1 — Magma Serpent*: Burrows through lava, erupts beneath random players. Ground telegraphs are essential. Tail sweep knocks players toward lava edges.
  - *Boss 2 — Obsidian Gargoyle*: Flies around, lands for melee. When it takes off, it creates wind that pushes players toward lava. Must be DPS'd during ground phases.
  - *Boss 3 — The Ashen Council*: Three Salamander shamans. Each casts different elemental spells. Must be interrupted in sequence. If one finishes a full cast, the other two gain empowerment.
  - *Boss 4 — Volcanic Titan Construct*: A reactivated Titan guardian. Uses mechanics from all previous bosses in the dungeon. Has a "magma shield" that must be broken by environmental mechanics (redirecting lava flows).
  - *Boss 5 — Embertide, Avatar of Pyralis*: The final boss. The volcano is erupting during the fight. Platform shrinks over time (lava rises). Boss does massive fire AoE. Players must DPS during calm windows. At 20% HP, the boss channels "Eruption" — a 30-second DPS check to kill it before the platform is fully consumed.
- **Loot Table:** Volcanic set (rare), Pyralis' Fang (epic 1H sword), chance at Mount Pyralis Core (legendary crafting material)

**5. The Eternal Forge (Level 35, Mythic Raid Dungeon)**
- **Theme:** The mythical forge where the Titans crafted the world
- **Bosses:** 6
- **Mechanics:** 20-man content. The ultimate Cinderlands challenge.
  - Complex multi-room encounters involving forge mechanics (heating/cooling metal, timing hammer strikes)
  - Final boss: A fully awakened Titan Construct that requires coordination between all 20 players across 4 platforms

#### World Bosses (The Cinderlands)

**1. Magmawyrm Krathul** (Level 30, Open World)
- An ancient magma dragon. Spawns during eruption events. 20–30 players. Drops epic fire-resistant crafting materials and a 3% mount drop (Obsidian Drake).

**2. The Ashen Colossus** (Level 35, Open World)
- A walking volcano that moves across the zone. Dynamic fight where the terrain changes as the boss moves. 25–35 players. Drops legendary fire weapons.

---

### Region 3: THE ABYSSAL REACH — Depths of the Drowned World

**Biome:** Coastal archipelago, underwater cities, coral forests, deep ocean trenches, floating market-islands, kelp swamps
**Dominant Race:** Merfolk (Tidekin) and Coastal Humans
**Shard:** Tide (Thalassor)
**Climate:** Tropical maritime, frequent hurricanes, bioluminescent tides
**Threat Level:** 20–40

**Lore:** The Abyssal Reach is defined by its relationship with the ocean. The Sundering flooded vast inland areas, creating a sprawling archipelago. The Tidekin Merfolk control the underwater portions, while Coastal Humans inhabit the surface islands. The Shard of Tide creates powerful currents that connect distant parts of the region — and also spawn deadly whirlpools and tidal waves.

**Key Environmental Mechanics:**
- **Tidal Cycles**: Water levels change every 2 hours, opening/closing underwater areas and exposing/hiding resources
- **Current Highways**: Fast underwater travel paths that move players between islands (but can dump them into dangerous areas)
- **Pressure Zones**: Deep areas require special gear or abilities to survive
- **Storm Events**: Hurricanes that create dynamic wave obstacles and spawn sea creatures

#### Major Cities

**1. Tidesong, The Floating Capital**
- **Population:** ~40,000
- **Description:** A city built on interconnected floating platforms anchored above a massive coral reef. Half above water, half below. Crystal domes protect the underwater sections.
- **Services:** Full city services, unique underwater auction house, fishing tournament grounds, ship customization dock
- **Key NPCs:**
  - **Tide-Queen Nereida** — Merfolk ruler seeking to unite the surface and sea peoples
  - **Captain Stormwhisker** — A pirate-turned-ally who offers smuggling quests and rare goods
  - **Deep Scholar Corallis** — Underwater archaeology quests that reveal Titan lore

**2. Coral Haven**
- **Population:** ~15,000
- **Description:** A peaceful trading port on the largest surface island. Known for its markets and shipwrights.
- **Key NPCs:** Standard services plus a Ship Captain who offers transport quests between islands.

**3. The Drowned Quarter**
- **Population:** ~8,000
- **Description:** A sunken district of an ancient city, now partially reclaimed by Merfolk. Atmospheric underwater ruins with air-pocket safe zones.
- **Key NPCs:** Underwater exploration trainer, rare diving gear vendor.

#### Dungeons (The Abyssal Reach)

**1. The Coral Labyrinth (Level 20–23, Normal)**
- **Theme:** A maze of living coral that shifts and grows
- **Bosses:** 4
- **Mechanics:** The maze changes between attempts. Coral growth blocks and opens paths. Underwater segments require managing breath meter (air bubbles provide replenishment).
  - *Boss 1 — Coral Guardian*: Covered in living coral armor that must be broken by directing the boss into sharp coral formations in the room.
  - *Boss 2 — The Jellyfish Swarm*: Not a single entity but a collective. Players must DPS the central queen while avoiding drifting jellyfish (paralysis on contact). The queen relocates every 20s.
  - *Boss 3 — Abyssal Angler*: Uses its lure to pull players into deep water (increased pressure damage). Players must break line-of-sight with the lure. Creates darkness zones where only the lure's light is visible.
  - *Boss 4 — Tidal Sentinel*: A water elemental that controls the room's water level. At high water: increased movement speed, reduced damage. At low water: normal speed, normal damage. Sentinel raises/lowers water strategically — players must adapt.

**2. The Sunken Temple of Thalassor (Level 25–28, Normal)**
- **Theme:** An ancient temple to the Tide Titan, partially flooded
- **Bosses:** 4
- **Mechanics:**
  - *Boss 1 — Temple Guardian (Statue)*: Animated statue. Pulls water from the environment to create water arms that slam platforms. Players must DPS between arm attacks.
  - *Boss 2 — The Drowned Priest*: A ghost that phases between underwater and surface. Underwater phase: can only be hit by ranged attacks through the water surface. Surface phase: melee vulnerable but casts powerful AoE water spells.
  - *Boss 3 — Leviathan Spawn*: A baby sea serpent in the temple's flooded chamber. Coils around pillars — players must DPS segments while avoiding tail sweeps. Breaks pillars when coiling — arena shrinks.
  - *Boss 4 — Thalassor's Echo*: A remnant of the Tide Titan. Controls water in the entire room — creating platforms, barriers, and attack waves. Players must surf water currents to reach safe zones while DPSing.

**3. The Maelstrom (Level 30–33, Heroic)**
- **Theme:** Fighting inside a perpetual magical whirlpool
- **Bosses:** 5
- **Mechanics:** The entire dungeon takes place on platforms suspended in a massive whirlpool. Falling off = death. The whirlpool's rotation affects movement — moving with the current is faster, against it is slower. Platforms periodically get sucked in and replaced.

**4. The Deep Trench (Level 35–38, Heroic)**
- **Theme:** The deepest point of the ocean, filled with bizarre creatures and Void corruption
- **Bosses:** 5
- **Mechanics:** Extreme pressure damage. Light sources attract enemies. Darkness mechanics where players can only see a small radius around them. Multiple "abyssal horror" encounters that use fear mechanics.

**5. Throne of the Drowned King (Level 40, Mythic Raid Dungeon)**
- **Theme:** The ancient seat of the first Tidekin monarch, now Void-corrupted
- **Bosses:** 6
- **Mechanics:** 10-man. Combines water, Void, and political intrigue mechanics. Final boss requires players to choose which of three advisors to sacrifice (each choice changes the final boss's abilities).

#### World Bosses (The Abyssal Reach)

**1. The Kraken** (Level 35, Open World)
- Emerges from the deep every 8 hours. 25–35 players. Tentacle-based mechanics. Drops a submarine mount (1% drop rate).

**2. Storm Leviathan** (Level 40, Open World)
- A massive storm creature that creates hurricanes. 30–40 players. Dynamic fight requiring coordination across multiple ships/platforms.

---

### Region 4: THE IRONSPINE PEAKS — Fortress of Stone and Steel

**Biome:** Mountain ranges, underground dwarven holds, crystal caverns, floating rock formations, frozen peaks, deep mines
**Dominant Race:** Mountain Dwarves (Stoneheart) and Goliaths
**Shard:** Stone (Granitus)
**Climate:** Alpine to arctic, with geothermal pockets in the depths
**Threat Level:** 25–45

**Lore:** The Ironspine Peaks are the most geologically stable region, thanks to the Shard of Stone's influence. The Stoneheart Dwarves have carved vast underground civilizations into the mountains. The Goliaths — massive humanoid beings — inhabit the highest peaks. The Sundering caused portions of the mountains to float, creating sky-islands connected by ancient bridges.

#### Major Cities

**1. Ironhold, The Mountain Throne**
- **Population:** ~60,000
- **Description:** A massive Dwarven city carved into the heart of the tallest mountain. Multiple levels connected by mine-cart rails and crystal elevators.
- **Key NPCs:**
  - **High King Granite Fist** — Ruler of all Stoneheart Dwarves
  - **Master Engineer Tock Gearwright** — Engineering trainer with unique schematics

**2. Skyreach Citadel**
- **Population:** ~12,000
- **Description:** A fortress on the largest floating rock formation. Military outpost and aerial training ground.
- **Key NPCs:**
  - **Wing Commander Skyhammer** — Offers aerial combat quests
  - **Windcaller Zara** — Goliath shaman, teaches wind magic

**3. Deepholm Mines**
- **Population:** ~15,000
- **Description:** A mining settlement at the deepest accessible point. Rich in rare ores but plagued by underground creatures.
- **Key NPCs:**
  - **Foreman Ironfoot** — Mining daily quests
  - **Geologist Pebble** — Lore quests about the Shard of Stone

#### Dungeons (The Ironspine Peaks)

**1. The Granite Gauntlet (Level 25–28, Normal)**
- **Theme:** A series of carved stone challenges designed by ancient Dwarven architects
- **Bosses:** 4
- **Mechanics:**
  - *Boss 1 — Stone Sentinel*: A massive golem. Immune to damage while its armor is intact. Players must use environmental crushers (pressing plates) to crack its armor at specific HP thresholds.
  - *Boss 2 — The Crystal Weavers (x4)*: Four crystal spiders that create webs of energy. Players caught in webs take damage over time. Webs must be destroyed, but each destruction releases a shockwave.
  - *Boss 3 — Gravity Warden*: Controls gravity in the room. Flips gravity periodically — players must grab onto anchor points or fall to the ceiling (which has spikes). During zero-gravity phases, projectiles curve.
  - *Boss 4 — The Architect's Challenge*: A puzzle boss. The room is a mechanical clockwork device. Players must hit gears in the correct sequence while avoiding crushing walls and steam jets. Three incorrect sequences = wipe.

**2. The Crystal Caverns (Level 28–31, Normal)**
- **Theme:** Natural caverns filled with magical crystals that amplify abilities
- **Bosses:** 4
- **Mechanics:** Standing near colored crystals amplifies specific abilities (red = fire, blue = arcane, green = healing). Players must manage crystal proximity strategically.

**3. The Undercity (Level 33–36, Heroic)**
- **Theme:** An abandoned Dwarven city overrun by creatures from the deep
- **Bosses:** 5
- **Mechanics:** Darkness and sound-based mechanics. Players must avoid making noise near certain enemies or they enrage. Light sources attract flying enemies. Stealth sections interspersed with boss fights.

**4. The Skyforge (Level 38–41, Heroic)**
- **Theme:** An ancient forge on a floating island, accessible only by air
- **Bosses:** 5
- **Mechanics:** Wind mechanics push players toward edges. Falling off = landing on lower platforms (damage but survivable) or death if no platform below. Bosses use aerial attacks and knockback extensively.

**5. Heart of the Mountain (Level 45, Mythic Raid Dungeon)**
- **Theme:** The deepest point of the Ironspine Peaks, where the Shard of Stone resides
- **Bosses:** 7
- **Mechanics:** 20-man. Multiple environmental hazards. Final boss: Granitus Fragment — a piece of the Stone Titan that controls the entire mountain. Players fight while the room rotates, gravity shifts, and the mountain itself collapses around them.

#### World Bosses (The Ironspine Peaks)

**1. The Mountain King** (Level 40, Open World)
- An awakened Titan Construct the size of a mountain. 40+ players. The fight takes place across multiple elevations.

**2. Crystal Wyrm** (Level 45, Open World)
- A dragon made of living crystal. Reflects damage types. 30+ players.

---

### Region 5: THE SKYWARD EXPANSE — Realm Above the Clouds

**Biome:** Sky islands, cloud forests, floating cities, wind-swept plateaus, aerial coral reefs, storm vortexes
**Dominant Race:** Avians (winged humanoids) and Cloud Gnomes
**Shard:** Wind (Zephyria)
**Climate:** Variable — calm skies to devastating storms
**Threat Level:** 30–50

**Lore:** The Skyward Expanse exists on massive floating landmasses held aloft by the Shard of Wind's power. The Avians — a race of winged humanoids — have built a civilization among the clouds. Cloud Gnomes, eccentric inventors, create flying machines and weather-control devices. The Sundering caused some islands to collide, merged others, and created dangerous wind tunnels between them.

#### Major Cities

**1. Aerie, The Cloud City**
- **Population:** ~35,000
- **Description:** The largest floating city, built across three interconnected sky-islands. Crystal spires catch sunlight and power the city's weather shields. Landing platforms for mounts and airships surround the city.
- **Key NPCs:**
  - **Sky-Lord Aquilon** — Avian ruler, politically complex character
  - **Chief Tinkerer Sprocket** — Cloud Gnome engineering master

**2. Windhaven Outpost**
- **Population:** ~10,000
- **Description:** A military outpost on the edge of a storm vortex. Guards the region against Hollow incursions from below.
- **Key NPCs:** Military quest givers, aerial combat trainers.

**3. Nimbus Market**
- **Population:** ~8,000
- **Description:** A floating market that drifts on wind currents. Players must catch up to it (mount-based mini-game) to access rare vendors.
- **Key NPCs:** Rare material vendors, unique recipe sellers.

#### Dungeons (The Skyward Expanse)

**1. The Wind Tunnels (Level 30–33, Normal)**
- **Theme:** Navigating through compressed wind currents between sky islands
- **Bosses:** 4
- **Mechanics:** Constant wind effects that push players. Must use wind currents strategically to dodge attacks and reach platforms.

**2. The Storm Vortex (Level 33–36, Normal)**
- **Theme:** Inside a perpetual magical storm
- **Bosses:** 4
- **Mechanics:** Lightning strikes at random intervals. Players must watch for ground indicators. Wind shifts direction every 30s. Bosses use lightning and wind attacks.

**3. The Cloud Colosseum (Level 38–41, Heroic)**
- **Theme:** An ancient Avian arena in the sky
- **Bosses:** 5
- **Mechanics:** Arena-style fights with audience participation. Spectators (NPCs) throw buffs or debuffs based on player performance. Some fights are 1v1 with the party watching.

**4. The Eye of Zephyria (Level 42–45, Heroic)**
- **Theme:** A massive storm system surrounding the Shard of Wind's resting place
- **Bosses:** 5
- **Mechanics:** The entire dungeon is in constant motion. Platforms rotate, wind changes, lightning is constant. Extreme spatial awareness required.

**5. Zephyria's Throne (Level 50, Mythic Raid Dungeon)**
- **Theme:** The pinnacle of the Skyward Expanse, where the Wind Titan once held court
- **Bosses:** 7
- **Mechanics:** 20-man. Vertical fight across multiple sky platforms. Players must manage flight/falling mechanics. Final boss has a "Sky Fall" mechanic that ejects players from the platform — they must fly back within 10 seconds or die.

#### World Bosses (The Skyward Expanse)

**1. Storm Dragon Tempestus** (Level 45, Open World)
- A dragon made of living storm. 35+ players. Creates tornados that relocate players.

**2. The Sky Serpent** (Level 50, Open World)
- A miles-long serpent that coils around sky islands. 40+ players. Multi-phase fight across three islands.

---

### Region 6: THE UMBRAL DEPTHS — Realm of Shadow and Secrets

**Biome:** Perpetual twilight, shadow forests, ghost towns, spirit realm overlaps, memory landscapes, void-touched wastelands
**Dominant Race:** Shade Elves and Humans (Shadow-touched)
**Shard:** Shadow (Nocturna)
**Climate:** Cool, dim, with pockets of absolute darkness and rare sunlight
**Threat Level:** 35–50

**Lore:** The Umbral Depths is the most dangerous region, closest to the Void. The Shard of Shadow maintains a balance between life and death here — spirits walk among the living, memories manifest as physical entities, and the boundary between reality and the Void is thinnest. The Shade Elves, descendants of elves who embraced the shadow, have adapted to thrive in this twilight world.

#### Major Cities

**1. Nocturne, The Twilight Capital**
- **Population:** ~30,000
- **Description:** A city that exists partially in the spirit realm. Buildings shift between solid and ethereal. Some streets only exist at night. The city has a "day" side (more solid) and "night" side (more spectral).
- **Key NPCs:**
  - **The Shade Council** — Five leaders who govern through consensus
  - **Spirit Whisperer Moira** — Spirit communication quests

**2. Hollow's Edge**
- **Population:** ~6,000
- **Description:** A frontier town on the border of a Void-touched wasteland. The most dangerous settlement in Aethermere.
- **Key NPCs:** Void resistance fighters, anti-Hollow weapon vendors.

**3. Memory Gardens**
- **Population:** ~4,000
- **Description:** A sacred grove where memories of the dead manifest as interactive illusions. Players can experience lore events firsthand.
- **Key NPCs:** Lore keepers, ghostly quest givers.

#### Dungeons (The Umbral Depths)

**1. The Shadow Warren (Level 35–38, Normal)**
- **Theme:** A maze of shifting shadows
- **Bosses:** 4
- **Mechanics:** Darkness mechanics. Players carry a "light radius" that can be expanded or contracted. Expanding = see more but attract more enemies. Contracting = stealth but limited vision.

**2. The Memory Palace (Level 38–41, Normal)**
- **Theme:** A building made of crystallized memories
- **Bosses:** 4
- **Mechanics:** Each boss fight takes place in a different "memory" — a historical event from Aethermere's past. Players experience the event and must alter its outcome to defeat the boss.

**3. The Void Gate (Level 42–45, Heroic)**
- **Theme:** The largest rift to the Void Realm
- **Bosses:** 5
- **Mechanics:** Reality distortion — the room's geometry shifts. Void corruption stacks on players, requiring periodic cleansing at light shrines. Bosses are Void entities with unique, non-standard attack patterns.

**4. The Spirit Realm (Level 46–49, Heroic)**
- **Theme:** Fully in the spirit realm — the physical world is visible but inaccessible
- **Bosses:** 5
- **Mechanics:** Players exist as spirits. Some abilities work differently. Healing becomes damage against spirit enemies. Physical attacks are less effective. Must use spirit-specific mechanics.

**5. The Nexus Breach (Level 50, Mythic Raid Dungeon)**
- **Theme:** The point where the Void is breaking through into Aethermere
- **Bosses:** 8
- **Mechanics:** 20-man. The final raid of the base game. Players face the leaders of The Hollow. The final boss is **Nihil's Avatar** — a manifestation of the Void itself. The fight spans three phases across three realms (physical, spirit, Void) and requires mastery of all game mechanics.

#### World Bosses (The Umbral Depths)

**1. The Hollow King** (Level 50, Open World)
- The leader of The Hollow forces in Aethermere. 40+ players. Drops legendary shadow-themed gear and a Void Mount (0.5% drop rate).

**2. Memory of Valdris** (Level 50, Open World)
- The memory-echo of the archmage who caused The Sundering. 40+ players. Uses all seven Shard abilities.

---

## 1.4 Faction System

### Three Major Factions

#### 1. The Aether Accord
**Philosophy:** Unity, cooperation, restoration of the Nexus Core through collaboration
**Leader:** High Councilor Aelindra (Evergrove)
**Headquarters:** The Nexus Sanctum
**Colors:** Gold and White
**Symbol:** Seven interlocking rings

**Reputation Tracks:**

| Rank | Reputation Required | Title | Rewards |
|------|-------------------|-------|---------|
| Neutral | 0 | Outsider | Basic vendor access |
| Friendly | 3,000 | Associate | 10% vendor discount, Accord tabard |
| Honored | 9,000 | Advocate | Access to Accord quartermaster, rare recipes |
| Revered | 21,000 | Steward | Epic gear vendor, profession patterns |
| Exalted | 42,000 | Champion | Legendary crafting materials, unique mount (Accord Gryphon), Accord Champion title |

**Reputation Sources:**
- Main story quests: 500–2,000 rep each
- Daily quests: 75–150 rep each (5 dailies available per day)
- Dungeon completions: 250–500 rep
- Raid completions: 1,000–2,000 rep
- World events: 500–1,500 rep

#### 2. The Iron Covenant
**Philosophy:** Strength through independence, regional self-sufficiency, military power
**Leader:** Forge-King Thorgrim Ironbeard (Cinderlands)
**Headquarters:** Forgeheart
**Colors:** Red and Black
**Symbol:** A crossed hammer and sword

**Reputation Tracks:**

| Rank | Reputation Required | Title | Rewards |
|------|-------------------|-------|---------|
| Neutral | 0 | Outsider | Basic vendor access |
| Friendly | 3,000 | Recruit | 10% vendor discount, Covenant bracers |
| Honored | 9,000 | Soldier | Access to Covenant armory, combat recipes |
| Revered | 21,000 | Warleader | Epic combat gear, siege schematics |
| Exalted | 42,000 | Overlord | Legendary weapons, unique mount (War Mammoth), Iron Overlord title |

#### 3. The Veil Walkers
**Philosophy:** Knowledge, understanding the Void, coexistence with shadow, pushing boundaries
**Leader:** The Shade Council (Umbral Depths)
**Headquarters:** Nocturne
**Colors:** Purple and Silver
**Symbol:** An open eye within a crescent moon

**Reputation Tracks:**

| Rank | Reputation Required | Title | Rewards |
|------|-------------------|-------|---------|
| Neutral | 0 | Outsider | Basic vendor access |
| Friendly | 3,000 | Initiate | 10% vendor discount, Veil Walker cloak |
| Honored | 9,000 | Adept | Access to Void-infused recipes, shadow abilities |
| Revered | 21,000 | Seer | Epic shadow gear, spirit realm access |
| Exalted | 42,000 | Voidwalker | Legendary Void items, unique mount (Shadow Steed), Voidwalker title |

### Faction Relationships

| | Aether Accord | Iron Covenant | Veil Walkers |
|---|---|---|---|
| **Aether Accord** | — | Tense (0.8x rep gain from shared sources) | Friendly (1.2x rep gain) |
| **Iron Covenant** | Tense (0.8x) | — | Hostile (0.5x rep gain, PvP flag in faction zones) |
| **Veil Walkers** | Friendly (1.2x) | Hostile (0.5x) | — |

Players can earn reputation with all three factions, but the rate varies based on relationships. Maximum exalted with all three is possible but requires significantly more effort.

### Faction Perks (Exalted Rank)

**Aether Accord Exalted:**
- Unique mount: Accord Gryphon (flying mount, 310% speed)
- Passive: +5% XP gain in group content
- Active: "Call to Accord" — summon an Accord NPC ally for 30 seconds (5-minute cooldown)
- Profession bonus: +10% crafting quality in Nexus Sanctum

**Iron Covenant Exalted:**
- Unique mount: War Mammoth (ground mount, 200% speed, has carry capacity for 2 additional players)
- Passive: +5% damage in PvP
- Active: "Iron Will" — immune to crowd control for 8 seconds (3-minute cooldown)
- Profession bonus: +15% Blacksmithing output quantity

**Veil Walkers Exalted:**
- Unique mount: Shadow Steed (ground mount, 240% speed, can phase through obstacles)
- Passive: +10% movement speed in stealth
- Active: "Veil Step" — teleport 30 yards (45-second cooldown)
- Profession bonus: Access to Void-infused crafting (creates items with unique Void enchantments)

---

---

## 2. CLASSES

### 2.1 Warrior

**Lore:** Warriors are masters of martial combat, forged in the crucible of endless battle. They draw strength from rage — the fury of combat fuels their most devastating abilities. Warriors in Aethermere serve as frontline defenders and unstoppable berserkers alike.

**Role:** Tank (Guardian) / DPS (Gladiator, Berserker)

**Base Stats by Level:**

| Stat | Level 1 | Level 25 | Level 50 |
|---|---|---|---|
| Strength | 18 | 95 | 190 |
| Agility | 10 | 52 | 105 |
| Intellect | 6 | 31 | 62 |
| Spirit | 8 | 42 | 84 |
| Stamina | 16 | 84 | 168 |
| Armor | 15 | 120 | 280 |
| HP | 220 | 1850 | 4200 |
| Attack Power | 22 | 118 | 245 |

**Resource:** Rage (0-100, decays out of combat at 3/sec, generates 5 per melee hit taken, 2 per hit given)

#### Specialization 1: Gladiator (DPS)
*"The arena taught me one thing: there is always a weaker opponent."*

| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Slash | Active | A swift sword strike | AP * 1.2 + 15 | 0s | 0 | Melee |
| 2 | Rend | Active | Wound the target, dealing damage over 8s | AP * 0.3 per tick (4 ticks) | 6s | 10 Rage | Melee |
| 3 | Whirlwind | Active | Strike all enemies within range | AP * 0.9 to each | 8s | 25 Rage | 5yd |
| 4 | Execute | Active | Devastating blow on targets below 20% HP | AP * 3.5 | 6s | 30 Rage | Melee |
| 5 | Overpower | Active | Quick counter after a dodge | AP * 2.0 | 5s | 5 Rage | Melee |
| 6 | Mortal Strike | Active | Deep wound reducing healing received by 50% for 10s | AP * 2.5 | 8s | 30 Rage | Melee |
| 7 | Charge | Active | Rush to a target, stunning for 1.5s | AP * 0.5 + stun | 15s | 0 | 8-25yd |
| 8 | Shattering Throw | Active | Removes shield effects and deals damage | AP * 1.8 | 30s | 25 Rage | 15yd |
| 9 | Bladestorm | Active | Spin for 6s, hitting all nearby every 1s | AP * 1.0 per hit | 60s | 50 Rage | 5yd |
| 10 | Recklessness | Active | +30% crit, +20% damage taken for 12s | Buff | 90s | 0 | Self |
| 11 | Heroic Throw | Active | Ranged attack with equipped weapon | AP * 1.5 | 8s | 0 | 15yd |
| 12 | Pummel | Active | Interrupt spellcasting | Interrupt | 15s | 10 Rage | Melee |
| 13 | Hamstring | Active | Reduce target movement speed by 50% for 15s | AP * 0.5 + slow | 8s | 10 Rage | Melee |
| 14 | Sweeping Strikes | Active | Auto-attacks hit 1 additional nearby target | Buff | 20s | 20 Rage | Self |
| 15 | Die by the Sword | Active | +100% parry for 8s | Defensive | 120s | 0 | Self |
| 16 | Skull Banner | Active | +20% crit damage for party for 10s | Buff | 180s | 0 | 30yd |
| 17 | Avatar | Active | +20% damage, immune to roots for 20s | Buff | 180s | 0 | Self |
| 18 | Warbreaker | Active | Shatter armor, +15% physical damage taken for 10s | AP * 2.0 + debuff | 45s | 20 Rage | Melee |
| 19 | Ravager | Active | Throw axes at location, dealing damage over 6s | AP * 1.5 per tick | 60s | 30 Rage | 10yd |
| 20 | Storm Bolt | Active | Hurl a hammer, stunning for 4s | AP * 2.0 + stun | 30s | 20 Rage | 20yd |
| 21 | Siegebreaker | Ultimate | Massive overhead slam: AP * 5.0, resets Execute CD | AP * 5.0 | 180s | 50 Rage | Melee |

**Passives:**
- *Unyielding:* +10% max HP
- *Critical Strikes:* +5% critical strike chance with melee weapons
- *Enrage:* After landing a critical hit, +10% damage for 6s (stacks to 3)
- *Plate Specialization:* +5% Strength when wearing all plate armor

#### Specialization 2: Guardian (Tank)
*"I am the wall between darkness and those I protect."*

| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Shield Slam | Active | Slam with shield, deals damage and generates threat | AP * 1.5 + 300% threat | 6s | 0 | Melee |
| 2 | Shield Block | Active | +100% block chance for 6s | Defensive | 12s | 20 Rage | Self |
| 3 | Shield Wall | Active | -40% damage taken for 12s | Defensive | 180s | 0 | Self |
| 4 | Devastate | Active | Sunder armor, stacking 3x (-5% armor each) | AP * 1.0 + debuff | 0s | 0 | Melee |
| 5 | Thunder Clap | Active | AoE damage + slow all nearby enemies | AP * 0.8 + 30% slow | 6s | 15 Rage | 8yd |
| 6 | Shockwave | Active | Cone stun for 3s | AP * 1.0 + stun | 40s | 0 | 10yd cone |
| 7 | Last Stand | Active | +30% max HP for 15s | Defensive | 180s | 0 | Self |
| 8 | Demoralizing Shout | Active | -20% damage dealt by nearby enemies for 10s | Debuff | 90s | 0 | 10yd |
| 9 | Spell Reflection | Active | Reflect next spell for 5s | Defensive | 25s | 20 Rage | Self |
| 10 | Intervene | Active | Rush to ally, redirecting their next attack to you | Mobility | 30s | 0 | 25yd |
| 11 | Vigilance | Active | Redirect 30% of ally's threat to you for 12s | Buff | 120s | 0 | 30yd |
| 12 | Ignore Pain | Active | Absorb up to AP*3 damage | Absorb | 12s | 40 Rage | Self |
| 13 | Revenge | Active | After block/parry, hit for AP*2.0 and generate threat | AP * 2.0 + 200% threat | 3s | 0 | Melee |
| 14 | Challenging Shout | Active | Force all nearby enemies to attack you for 6s | Taunt AoE | 180s | 0 | 15yd |
| 15 | Taunt | Active | Force target to attack you for 3s + high threat | Taunt | 8s | 0 | 30yd |
| 16 | Bolster | Active | +15% block value for party for 10s | Buff | 120s | 0 | 30yd |
| 17 | Unstoppable Force | Active | Immune to CC for 8s | Buff | 180s | 0 | Self |
| 18 | Dragon's Roar | Active | Fear all enemies in cone for 4s | Fear | 60s | 0 | 10yd cone |
| 19 | Indomitable | Passive | +20% armor from all sources | Passive | — | — | Self |
| 20 | Safeguard | Passive | -15% damage taken when below 35% HP | Passive | — | — | Self |
| 21 | Colossus Smash | Ultimate | Devastating blow: AP*4.0, ignores 100% armor for 10s | AP * 4.0 | 180s | 30 Rage | Melee |

**Passives:**
- *Unwavering:* +10% block chance
- *Vengeance:* Taking damage generates 5% of damage taken as Rage
- *Heavy Armor:* +15% armor from plate items
- *Last Stand (Passive):* When HP drops below 10%, instantly heal to 15% HP (5-minute internal CD)

#### Specialization 3: Berserker (DPS)
*"Blood and fury. That is all I need."*

| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Bloodthirst | Active | Vicious strike that heals for 20% of damage | AP * 1.8 + heal | 4.5s | 10 Rage | Melee |
| 2 | Raging Blow | Active | Both weapons strike simultaneously | AP * 2.2 (2 hits) | 6s | 15 Rage | Melee |
| 3 | Furious Slash | Active | Quick strike increasing haste by 3% for 10s (stacks 3x) | AP * 1.0 + buff | 3s | 0 | Melee |
| 4 | Rampage | Active | Unleash 5 rapid strikes | AP * 0.8 * 5 hits | 8s | 40 Rage | Melee |
| 5 | Berserker Rage | Active | Enrage for 12s: +25% attack speed, +15% damage | Buff | 60s | 0 | Self |
| 6 | Enraged Regeneration | Active | Heal 20% HP over 8s | Heal | 120s | 0 | Self |
| 7 | Piercing Howl | Active | Scream, slowing enemies by 50% for 15s | Slow | 12s | 10 Rage | 10yd |
| 8 | Intimidating Shout | Active | Fear up to 5 enemies for 8s | Fear | 90s | 0 | 8yd |
| 9 | Cleave | Active | Strike 3 enemies in front | AP * 1.2 to each | 6s | 10 Rage | 8yd |
| 10 | Dragon Roar | Active | Knockback + damage all nearby | AP * 2.0 + knockback | 35s | 0 | 8yd |
| 11 | Massacre | Passive | Execute usable at 35% HP instead of 20% | Passive | — | — | — |
| 12 | Carnage | Passive | Rampage costs 10 less Rage | Passive | — | — | — |
| 13 | Siegebreaker | Active | Physical attack that applies a damage debuff | AP * 2.5 + debuff | 45s | 20 Rage | Melee |
| 14 | Onslaught | Active | 3-hit combo with increasing damage | AP * (1.0 + 1.5 + 2.0) | 12s | 25 Rage | Melee |
| 15 | Warpaint | Passive | -10% damage taken while enraged | Passive | — | — | — |
| 16 | Bloodbath | Active | Next 3 attacks apply a bleed for 6s | Buff | 30s | 15 Rage | Self |
| 17 | Recklessness | Active | +30% crit chance for 10s | Buff | 90s | 0 | Self |
| 18 | Titan's Grip | Passive | Can wield 2-handed weapons in one hand | Passive | — | — | — |
| 19 | Slam | Active | Powerful overhead strike | AP * 2.8 | 0s | 20 Rage | Melee |
| 20 | Whirlwind | Active | Spin hitting all nearby, next 4 single-targets also cleave | AP * 0.8 + buff | 8s | 25 Rage | 5yd |
| 21 | Bladestorm | Ultimate | Unstoppable spin for 6s: AP*1.5 per hit, immune to CC | AP * 1.5 * 6 | 180s | 50 Rage | 5yd |

**Passives:**
- *Unbridled Fury:* +10% critical strike damage
- *Bloodcraze:* Critical hits grant 3 Rage
- *Flurry:* After 3 consecutive hits, next ability costs 50% less Rage
- *Dual Wield:* Can equip two one-handed weapons

---

### 2.2 Paladin

**Lore:** Paladins are holy warriors who channel the light of the Aether to protect allies and smite the wicked. They walk the line between martial prowess and divine magic, serving as bastions of hope in the darkest times.

**Role:** Tank (Protector) / DPS (Crusader, Avenger) / Healer (Protector secondary)

**Resource:** Holy Power (0-5, generated by abilities, spent on finishers)

**Base Stats by Level:**

| Stat | Level 1 | Level 25 | Level 50 |
|---|---|---|---|
| Strength | 15 | 78 | 157 |
| Agility | 8 | 42 | 84 |
| Intellect | 10 | 52 | 105 |
| Spirit | 12 | 63 | 126 |
| Stamina | 14 | 73 | 147 |
| Armor | 14 | 115 | 270 |
| HP | 200 | 1700 | 3900 |
| Mana | 180 | 1200 | 2800 |

#### Specialization 1: Crusader (DPS — Melee + Holy)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Crusader Strike | Active | Holy-infused strike, generates 1 Holy Power | SP * 1.0 + AP * 0.8 | 4.5s | 0 | Melee |
| 2 | Blade of Justice | Active | Piercing holy strike, generates 2 Holy Power | AP * 2.0 + holy | 10s | 0 | Melee |
| 3 | Judgment | Active | Hurl judgment at range, generates 1 Holy Power | SP * 1.5 | 8s | 0 | 20yd |
| 4 | Templar's Verdict | Active | Massive holy strike (3 Holy Power finisher) | AP * 3.0 + SP * 1.0 | 0s | 3 HP | Melee |
| 5 | Divine Storm | Active | Holy AoE damage (2 Holy Power finisher) | (AP + SP) * 1.5 to each | 0s | 2 HP | 8yd |
| 6 | Consecration | Active | Holy ground deals damage over 12s | SP * 0.4 per tick | 12s | 15% Mana | 8yd |
| 7 | Hammer of Wrath | Active | Ranged execute (usable below 20% HP) | AP * 2.5 | 6s | 0 | 20yd |
| 8 | Wake of Ashes | Active | Fire cone, generates 3 Holy Power | SP * 2.0 | 30s | 0 | 10yd cone |
| 9 | Avenger's Wrath | Active | +30% holy damage for 20s | Buff | 120s | 0 | Self |
| 10 | Rebuke | Active | Interrupt spellcasting | Interrupt | 15s | 0 | Melee |
| 11 | Turn Evil | Active | Fear undead/demon for 40s | CC | 30s | 10% Mana | 20yd |
| 12 | Blinding Light | Active | Blind all nearby enemies for 6s | CC | 90s | 10% Mana | 10yd |
| 13 | Cavalier | Passive | Divine Steed has 2 charges | Passive | — | — | — |
| 14 | Divine Steed | Active | Mount holy steed for 3s, +100% speed, immune to CC | Mobility | 45s | 0 | Self |
| 15 | Holy Avenger | Active | +30% Holy Power generation for 20s | Buff | 180s | 0 | Self |
| 16 | Seraphim | Active | +15% to all secondary stats for 15s (costs 3 HP) | Buff | 60s | 3 HP | Self |
| 17 | Execution Sentence | Active | Delayed holy damage after 8s | SP * 4.0 | 60s | 3 HP | 20yd |
| 18 | Final Reckoning | Active | Call down light at location after 3s | SP * 5.0 AoE | 60s | 0 | 30yd |
| 19 | Divine Purpose | Passive | 15% chance abilities cost no Holy Power | Passive | — | — | — |
| 20 | Zeal | Passive | Auto-attacks increase attack speed by 5% for 10s (stacks 5) | Passive | — | — | — |
| 21 | Radiant Decree | Ultimate | Massive holy explosion: (SP+AP)*6.0 to all nearby | (SP+AP) * 6.0 | 180s | 5 HP | 15yd |

#### Specialization 2: Avenger (DPS — Ranged Holy)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Holy Shock | Active | Instant holy damage or heal | SP * 2.0 | 6s | 12% Mana | 30yd |
| 2 | Exorcism | Active | Holy ranged attack | SP * 1.5 | 0s | 8% Mana | 30yd |
| 3 | Denounce | Active | Mark enemy, next Holy Shock is guaranteed crit | SP * 1.0 + debuff | 12s | 10% Mana | 30yd |
| 4 | Holy Prism | Active | Beam hits target and bounces to 4 nearby | SP * 1.2 per bounce | 20s | 15% Mana | 30yd |
| 5 | Light's Hammer | Active | Place holy AoE at location, heals allies/damages enemies | SP * 0.8 per tick | 60s | 20% Mana | 30yd |
| 6 | Judgment of Light | Active | Judging causes next 25 melee attacks on target to heal attackers | Heal on hit | 30s | 10% Mana | 30yd |
| 7 | Beacon of Light | Active | Target ally receives 40% of all your healing | Buff | 0s | 18% Mana | 40yd |
| 8 | Holy Avenger | Active | +30% haste for 20s | Buff | 180s | 0 | Self |
| 9 | Aura Mastery | Active | Devotion aura affects entire raid for 8s | Buff | 180s | 0 | 40yd |
| 10 | Cleanse | Active | Remove 1 poison, 1 disease, 1 magic debuff | Dispel | 8s | 14% Mana | 40yd |
| 11 | Hammer of Justice | Active | Stun target for 6s | Stun | 60s | 0 | 10yd |
| 12 | Repentance | Active | Incapacitate target for 1 minute | CC | 15s | 0 | 20yd |
| 13 | Sanctified Wrath | Passive | Avenger's Wrath also reduces Holy Shock CD to 1.5s | Passive | — | — | — |
| 14 | Avenging Crusader | Active | Your auto-attacks heal 3 nearby injured allies | Buff | 120s | 20% Mana | Self |
| 15 | Glimmer of Light | Passive | Holy Shock leaves a buff that heals over 30s | Passive | — | — | — |
| 16 | Rule of Law | Active | +30% range on all healing for 15s | Buff | 60s | 0 | Self |
| 17 | Unbreakable Spirit | Passive | -30% CD on Divine Shield, Lay on Hands, Holy Avenger | Passive | — | — | — |
| 18 | Saved by the Light | Passive | When below 20% HP, gain an absorb shield (3-min CD) | Passive | — | — | — |
| 19 | Lightbringer | Passive | Healing increased by 12% on targets within 10yd | Passive | — | — | — |
| 20 | Infusion of Light | Passive | Holy Shock crits reduce next Holy Light cast time by 50% | Passive | — | — | — |
| 21 | Awakening | Ultimate | Resurrect with full HP and 30s of +50% damage/healing | Resurrect + Buff | 600s | 0 | Self |

#### Specialization 3: Protector (Tank)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Shield of the Righteous | Active | Slam shield, deals damage, reduces damage taken by 20% for 4.5s | AP * 1.5 + DR buff | 0s | 3 HP | Melee |
| 2 | Avenger's Shield | Active | Bouncing shield hits 3 targets, silences for 3s | AP * 1.8 per target | 15s | 0 | 30yd |
| 3 | Consecration | Active | Holy ground, damage + generates threat | SP * 0.3 per tick | 9s | 12% Mana | 8yd |
| 4 | Judgment | Active | Ranged attack, generates 1 Holy Power + 50% increased threat | AP * 1.2 | 6s | 0 | 20yd |
| 5 | Hammer of the Righteous | Active | Melee + AoE, generates 1 Holy Power | AP * 1.0 + AP * 0.5 AoE | 4.5s | 0 | Melee |
| 6 | Ardent Defender | Active | -20% damage, if you die within 10s, heal to 20% instead | Defensive | 180s | 0 | Self |
| 7 | Guardian of Ancient Kings | Active | Summon guardian that absorbs 50% of your damage for 12s | Defensive | 300s | 0 | Self |
| 8 | Divine Shield | Active | Immune to all damage for 8s (reduces damage dealt by 50%) | Defensive | 300s | 0 | Self |
| 9 | Lay on Hands | Active | Heal target to full HP | Heal | 600s | 0 | 40yd |
| 10 | Blessing of Protection | Active | Immune to physical damage for 10s (can't attack) | Defensive | 300s | 0 | 40yd |
| 11 | Blessing of Freedom | Active | Remove and immune to movement impairments for 8s | Utility | 25s | 0 | 40yd |
| 12 | Blessing of Sacrifice | Active | Redirect 30% damage from ally to you for 12s | Utility | 120s | 0 | 40yd |
| 13 | Hand of Reckoning | Active | Taunt + high threat | Taunt | 8s | 0 | 30yd |
| 14 | Holy Shield | Passive | +15% block chance, blocking deals holy damage | Passive | — | — | — |
| 15 | Redoubt | Passive | Shield of the Righteous increases block value by 15% for 4.5s | Passive | — | — | — |
| 16 | First Avenger | Passive | Avenger's Shield hits 2 additional targets | Passive | — | — | — |
| 17 | Seraphim | Active | +15% secondary stats for 15s (costs 3 HP) | Buff | 60s | 3 HP | Self |
| 18 | Bastion of Light | Active | Next 3 Shield of the Righteous cost no Holy Power | Buff | 180s | 0 | Self |
| 19 | Eye of Tyr | Active | AoE damage + 25% damage reduction for 9s | AP * 2.0 + DR | 60s | 0 | 8yd |
| 20 | Moment of Glory | Passive | When blocking, 10% chance to reset Avenger's Shield CD | Passive | — | — | — |
| 21 | Final Stand | Ultimate | AoE taunt all nearby + Divine Shield for 8s | Taunt + Immune | 300s | 0 | 15yd |

---

### 2.3 Ranger

**Lore:** Rangers are masters of the wild, skilled in both ranged combat and beast companionship. They protect the borders of civilization, using the terrain and their keen senses to gain advantage over any foe.

**Role:** DPS (Marksmanship, Beastmaster) / Support (Trapper)

**Resource:** Focus (0-100, regens at 5/sec, abilities generate or cost Focus)

**Base Stats by Level:**

| Stat | Level 1 | Level 25 | Level 50 |
|---|---|---|---|
| Strength | 10 | 52 | 105 |
| Agility | 18 | 95 | 190 |
| Intellect | 8 | 42 | 84 |
| Spirit | 10 | 52 | 105 |
| Stamina | 12 | 63 | 126 |
| Armor | 8 | 65 | 150 |
| HP | 180 | 1500 | 3400 |
| Attack Power | 22 | 118 | 245 |

#### Specialization 1: Marksmanship (Ranged DPS)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Aimed Shot | Active | Powerful aimed shot (cast time 2.5s) | AGI * 3.0 | 12s | 35 Focus | 40yd |
| 2 | Steady Shot | Active | Basic ranged attack, generates 20 Focus | AGI * 1.0 + Focus gen | 0s | -20 Focus | 40yd |
| 3 | Arcane Shot | Active | Instant arcane-infused shot | AGI * 1.5 | 0s | 20 Focus | 40yd |
| 4 | Multi-Shot | Active | Hit up to 5 targets | AGI * 1.0 each | 0s | 40 Focus | 40yd |
| 5 | Rapid Fire | Active | +100% attack speed for 15s | Buff | 120s | 0 | Self |
| 6 | Trueshot | Active | +30% crit chance for 15s | Buff | 180s | 0 | Self |
| 7 | Kill Shot | Active | Execute on targets below 20% HP | AGI * 4.0 | 10s | 10 Focus | 40yd |
| 8 | Volley | Active | Rain arrows on area for 6s | AGI * 0.8 per tick | 60s | 60 Focus | 40yd |
| 9 | Bursting Shot | Active | Knockback + damage all in front | AGI * 1.2 + knockback | 30s | 20 Focus | 15yd cone |
| 10 | Counter Shot | Active | Interrupt spellcasting | Interrupt | 24s | 0 | 40yd |
| 11 | Disengage | Active | Leap backward 20 yards | Mobility | 20s | 0 | Self |
| 12 | Concussive Shot | Active | Slow target by 50% for 6s | AGI * 0.5 + slow | 5s | 10 Focus | 40yd |
| 13 | Hunter's Mark | Active | Mark target, +5% damage from all sources for 30s | Debuff | 20s | 0 | 40yd |
| 14 | Binding Shot | Active | Arrow that roots enemies for 8s in area | Root | 45s | 0 | 40yd |
| 15 | Barrage | Active | Rapid-fire cone for 3s | AGI * 0.5 * 6 hits | 20s | 60 Focus | 40yd cone |
| 16 | Careful Aim | Passive | Aimed Shot has +50% crit on targets above 80% HP | Passive | — | — | — |
| 17 | Double Tap | Active | Next Aimed Shot fires twice | Buff | 60s | 0 | Self |
| 18 | Lock and Load | Passive | 10% chance Auto-Shot makes next Aimed Shot instant | Passive | — | — | — |
| 19 | Steady Focus | Passive | 2 Steady Shots in a row = +20% haste for 15s | Passive | — | — | — |
| 20 | Lethal Shots | Passive | +10% critical strike chance | Passive | — | — | — |
| 21 | Sniper Shot | Ultimate | Channel for 3s, then fire for AGI*8.0 (can't miss) | AGI * 8.0 | 300s | 100 Focus | 60yd |

#### Specialization 2: Beastmaster (DPS + Pet)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Kill Command | Active | Command pet to strike | AGI * 2.0 + pet damage | 7.5s | 30 Focus | 25yd |
| 2 | Cobra Shot | Active | Quick shot, reduces Kill Command CD by 1s | AGI * 1.2 | 0s | 35 Focus | 40yd |
| 3 | Barbed Shot | Active | Bleed shot + pet attack speed +30% for 8s | AGI * 0.8 + bleed | 12s | -20 Focus | 40yd |
| 4 | Multi-Shot | Active | Hit 5 targets + pet cleave | AGI * 0.8 each | 0s | 40 Focus | 40yd |
| 5 | Bestial Wrath | Active | Pet goes berserk: +25% damage, immune to CC for 15s | Buff | 90s | 0 | Self |
| 6 | Aspect of the Wild | Active | +10% crit, +20% Focus generation for 20s | Buff | 120s | 0 | Self |
| 7 | Intimidation | Active | Pet stuns target for 5s | Stun | 60s | 0 | 25yd |
| 8 | Dire Beast | Active | Summon a beast to fight for 8s | Summon | 12s | 0 | 40yd |
| 9 | Stampede | Active | Summon a herd of beasts for 12s | Summon | 180s | 0 | 40yd |
| 10 | Call of the Wild | Active | Reduce all pet ability CDs by 50% | Buff | 120s | 0 | Self |
| 11 | Mend Pet | Active | Heal pet over 10s | Heal | 10s | 25 Focus | 45yd |
| 12 | Revive Pet | Active | Resurrect fallen pet | Resurrect | 10s | 35% Mana | — |
| 13 | Disengage | Active | Leap backward | Mobility | 20s | 0 | Self |
| 14 | Feign Death | Active | Fake death, drop all threat | Utility | 30s | 0 | Self |
| 15 | Freezing Trap | Active | Trap that freezes first enemy for 60s | CC | 30s | 0 | 40yd |
| 16 | Tar Trap | Active | Trap that slows by 50% in area | Slow | 30s | 0 | 40yd |
| 17 | Explosive Trap | Active | Trap that deals AoE damage | AGI * 2.0 | 30s | 0 | 40yd |
| 18 | Spitting Cobra | Active | Cobra that attacks for 30s | Summon | 120s | 0 | Self |
| 19 | Killer Instinct | Passive | Kill Command deals +30% damage to targets below 35% HP | Passive | — | — | — |
| 20 | Pack Tactics | Passive | +5% damage for each active pet/minion | Passive | — | — | — |
| 21 | Alpha Predator | Ultimate | Pet transforms into a primal beast for 20s: +100% damage, +50% HP | Transform | 300s | 0 | Self |

#### Specialization 3: Trapper (Ranged DPS + Utility)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Explosive Shot | Active | Shot that explodes after 3s | AGI * 2.5 AoE | 8s | 20 Focus | 40yd |
| 2 | Black Arrow | Active | Shadow damage shot + summon undead hawk | AGI * 1.5 + summon | 15s | 30 Focus | 40yd |
| 3 | Serpent Sting | Active | Poison shot dealing damage over 18s | AGI * 0.4 per tick | 0s | 20 Focus | 40yd |
| 4 | Bear Trap | Active | Immobilize target for 8s, dealing damage | AGI * 2.0 + root | 35s | 0 | 30yd |
| 5 | Net Launcher | Active | Root target for 6s | Root | 45s | 0 | 30yd |
| 6 | Caltrops | Active | Area that slows by 70% and deals damage | AGI * 0.3 per tick | 30s | 0 | 30yd |
| 7 | Camouflage | Active | Stealth for 60s or until attacking | Stealth | 60s | 0 | Self |
| 8 | Misdirection | Active | Redirect threat to target for 8s | Utility | 30s | 0 | 30yd |
| 9 | Flare | Active | Reveal stealthed enemies in area | Utility | 20s | 0 | 40yd |
| 10 | Scatter Shot | Active | Disorient target for 4s | CC | 30s | 0 | 15yd |
| 11 | Wyvern Sting | Active | Sleep target for 30s | CC | 60s | 0 | 35yd |
| 12 | Tranquilizing Shot | Active | Remove 1 enrage and 1 magic buff from target | Dispel | 10s | 20 Focus | 40yd |
| 13 | Lockdown | Passive | Trapped enemies take +15% damage | Passive | — | — | — |
| 14 | Trap Mastery | Passive | +2 charges on all traps, -30% CD | Passive | — | — | — |
| 15 | Expert Trapper | Passive | Traps last 50% longer and have +25% area | Passive | — | — | — |
| 16 | Venomous Bite | Passive | Serpent Sting has 20% chance to spread to nearby enemies | Passive | — | — | — |
| 17 | Survival Instincts | Active | +30% dodge for 8s | Buff | 120s | 0 | Self |
| 18 | Aspect of the Cheetah | Active | +90% movement speed for 3s, then +30% for 9s | Buff | 180s | 0 | Self |
| 19 | Natural Mending | Passive | Feign Death heals 20% HP over 5s | Passive | — | — | — |
| 20 | Guerrilla Tactics | Passive | First trap placed in combat is instant | Passive | — | — | — |
| 21 | Death Zone | Ultimate | Create a 15yd zone of traps for 10s: slow, root, bleed, damage | Multi-effect | 300s | 50 Focus | 40yd |

---

### 2.4 Rogue

**Lore:** Rogues are masters of stealth, subterfuge, and precise strikes. They operate in the shadows, eliminating targets before they even know they're in danger. In Aethermere, rogues serve as spies, assassins, and information brokers.

**Role:** DPS (Assassin, Blade Dancer, Shadow)

**Resource:** Energy (0-100, regens at 10/sec) + Combo Points (0-5, generated by abilities, spent on finishers)

**Base Stats by Level:**

| Stat | Level 1 | Level 25 | Level 50 |
|---|---|---|---|
| Strength | 12 | 63 | 126 |
| Agility | 18 | 95 | 190 |
| Intellect | 6 | 31 | 62 |
| Spirit | 8 | 42 | 84 |
| Stamina | 10 | 52 | 105 |
| Armor | 6 | 50 | 120 |
| HP | 160 | 1350 | 3100 |
| Attack Power | 22 | 118 | 245 |

#### Specialization 1: Assassin (DPS — Poisons & Bleeds)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Mutilate | Active | Both daggers strike, 2 Combo Points | AGI * 1.2 * 2 hits | 0s | 40 Energy | Melee |
| 2 | Garrote | Active | Silence + bleed for 18s, 1 CP | AGI * 0.3/tick + silence | 6s | 35 Energy | Melee |
| 3 | Rupture | Active | Finisher: bleed damage over time (CP-scaled) | AGI * 0.25/tick * CP | 0s | 25 Energy | Melee |
| 4 | Envenom | Active | Finisher: instant nature damage (CP-scaled) | AGI * 1.5 * CP | 0s | 35 Energy | Melee |
| 5 | Deadly Poison | Passive | Auto-attacks have 30% chance to apply poison stack | Nature DoT | — | — | — |
| 6 | Wound Poison | Passive | Auto-attacks reduce healing received by 3% per stack (max 5) | Debuff | — | — | — |
| 7 | Vendetta | Active | +30% damage to target for 20s | Debuff | 120s | 0 | 30yd |
| 8 | Vanish | Active | Enter stealth + drop all threat | Stealth | 120s | 0 | Self |
| 9 | Stealth | Active | Enter stealth mode, -70% movement speed | Stealth | 0s | 0 | Self |
| 10 | Cheap Shot | Active | Stun 4s from stealth, 2 CP | Stun | 0s | 40 Energy | Melee |
| 11 | Kidney Shot | Active | Finisher: stun (CP-scaled, 1-6s) | Stun | 0s | 25 Energy | Melee |
| 12 | Kick | Active | Interrupt spellcasting | Interrupt | 15s | 0 | Melee |
| 13 | Evasion | Active | +50% dodge for 10s | Defensive | 120s | 0 | Self |
| 14 | Cloak of Shadows | Active | Immune to magic for 5s | Defensive | 120s | 0 | Self |
| 15 | Crimson Tempest | Active | Finisher: AoE bleed around you | AGI * 0.2/tick * CP AoE | 0s | 35 Energy | 8yd |
| 16 | Shroud of Concealment | Active | Stealth entire party for 15s | Utility | 360s | 0 | 20yd |
| 17 | Shiv | Active | Apply active poison immediately + 1 CP | AGI * 0.8 + poison | 8s | 20 Energy | Melee |
| 18 | Toxic Blade | Active | +30% poison damage for 9s | Debuff | 25s | 0 | Melee |
| 19 | Master Assassin | Passive | +50% crit chance from stealth for 3s | Passive | — | — | — |
| 20 | Venom Rush | Passive | Energy regen +10% per poisoned target | Passive | — | — | — |
| 21 | Death Mark | Ultimate | Mark target for 8s: all damage duplicated at 30% as nature | AGI * 5.0 + debuff | 300s | 50 Energy | Melee |

#### Specialization 2: Blade Dancer (DPS — Swords & Agility)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Sinister Strike | Active | Primary attack, 1 CP | AGI * 1.5 | 0s | 45 Energy | Melee |
| 2 | Backstab | Active | Must be behind target, 1 CP | AGI * 2.0 | 0s | 35 Energy | Melee |
| 3 | Eviscerate | Active | Finisher: devastating strike (CP-scaled) | AGI * 2.0 * CP | 0s | 35 Energy | Melee |
| 4 | Slice and Dice | Active | Finisher: +40% attack speed (CP-scaled duration) | Buff | 0s | 25 Energy | Self |
| 5 | Blade Flurry | Active | Auto-attacks hit 1 additional target for 15s | Buff | 10s | 15 Energy | Self |
| 6 | Adrenaline Rush | Active | +50% energy regen, +20% attack speed for 15s | Buff | 180s | 0 | Self |
| 7 | Killing Spree | Active | Teleport to 5 random enemies, striking each | AGI * 1.8 * 5 | 120s | 0 | 10yd |
| 8 | Between the Eyes | Active | Finisher: ranged attack + stun 4s | AGI * 2.5 * CP/5 + stun | 20s | 35 Energy | 20yd |
| 9 | Sprint | Active | +70% movement speed for 8s | Buff | 60s | 0 | Self |
| 10 | Grappling Hook | Active | Launch to target location | Mobility | 30s | 0 | 30yd |
| 11 | Feint | Active | -40% AoE damage taken for 6s | Defensive | 15s | 20 Energy | Self |
| 12 | Riposte | Active | Parry all attacks for 5s | Defensive | 120s | 0 | Self |
| 13 | Ghostly Strike | Active | Attack from stealth with +50% crit | AGI * 2.5 | 30s | 30 Energy | Melee |
| 14 | Ambush | Active | High damage opener from stealth, 2 CP | AGI * 3.0 | 0s | 60 Energy | Melee |
| 15 | Dismantle | Active | Disarm target for 10s | Utility | 60s | 0 | Melee |
| 16 | Shadowstep | Active | Teleport behind target | Mobility | 20s | 0 | 25yd |
| 17 | Smoke Bomb | Active | Create smoke cloud: enemies inside can't be targeted | Utility | 180s | 0 | 8yd |
| 18 | Marked for Death | Active | Target dies within 1 min = +5 CP | Buff | 60s | 0 | 30yd |
| 19 | Ruthlessness | Passive | Finishers have 20% chance per CP to grant 1 CP | Passive | — | — | — |
| 20 | Opportunity | Passive | Sinister Strike has 15% chance to make next Backstab free | Passive | — | — | — |
| 21 | Dance of Death | Ultimate | Enter a trance for 8s: all abilities cost 0 Energy, +50% damage | Buff | 300s | 0 | Self |

#### Specialization 3: Shadow (DPS — Stealth & Debuffs)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Shadow Strike | Active | Strike from shadow, +40% damage from stealth | AGI * 2.0 + stealth bonus | 0s | 40 Energy | Melee |
| 2 | Nightblade | Active | Finisher: shadow DoT + slow 30% | Shadow DoT * CP | 0s | 30 Energy | Melee |
| 3 | Eviscerate | Active | Finisher: physical damage (CP-scaled) | AGI * 2.0 * CP | 0s | 35 Energy | Melee |
| 4 | Shadow Dance | Active | Allow use of stealth abilities for 6s | Buff | 60s | 0 | Self |
| 5 | Shadow Blades | Active | Auto-attacks generate 1 CP and deal shadow damage | Buff | 180s | 0 | Self |
| 6 | Symbols of Death | Active | +15% damage for 35s | Buff | 0s | 20 Energy | Self |
| 7 | Shuriken Storm | Active | AoE shadow damage, 1 CP per target | AGI * 0.8 each | 0s | 30 Energy | 10yd |
| 8 | Shuriken Toss | Active | Ranged attack, 1 CP | AGI * 1.0 | 0s | 40 Energy | 30yd |
| 9 | Shadowy Duel | Active | Duel target in shadow realm for 6s | PvP | 120s | 0 | 10yd |
| 10 | Cloak of Shadows | Active | Magic immunity 5s | Defensive | 120s | 0 | Self |
| 11 | Vanish | Active | Enter stealth | Stealth | 120s | 0 | Self |
| 12 | Blind | Active | Disorient target for 60s | CC | 120s | 0 | 15yd |
| 13 | Gouge | Active | Incapacitate 4s (must be facing) | CC | 10s | 25 Energy | Melee |
| 14 | Sap | Active | Incapacitate target from stealth for 60s | CC | 0s | 25 Energy | Melee |
| 15 | Pick Pocket | Active | Steal items from target | Utility | 0s | 0 | Melee |
| 16 | Subterfuge | Passive | Stealth persists 3s after leaving stealth | Passive | — | — | — |
| 17 | Shadow Focus | Passive | Abilities cost -20% Energy from stealth | Passive | — | — | — |
| 18 | Premeditation | Passive | Stealth openers grant +2 CP | Passive | — | — | — |
| 19 | Find Weakness | Passive | Stealth openers ignore 30% armor for 10s | Passive | — | — | — |
| 20 | Dark Shadow | Passive | Shadow Dance increases damage by 15% | Passive | — | — | — |
| 21 | Shadow Nova | Ultimate | Massive shadow explosion at location: AGI*7.0 AoE | AGI * 7.0 | 300s | 50 Energy | 30yd |

---

### 2.5 Mage

**Lore:** Mages are masters of the arcane, wielding the fundamental forces of creation itself. They shape fire, ice, and raw arcane energy into devastating spells. In Aethermere, mages study at the Nexus Academy, where the boundaries of reality are explored and pushed.

**Role:** DPS (Elemental, Arcane, Frost)

**Resource:** Mana (0-max, regens at 1% per second, reduced by Spirit)

**Base Stats by Level:**

| Stat | Level 1 | Level 25 | Level 50 |
|---|---|---|---|
| Strength | 6 | 31 | 62 |
| Agility | 8 | 42 | 84 |
| Intellect | 18 | 95 | 190 |
| Spirit | 14 | 73 | 147 |
| Stamina | 8 | 42 | 84 |
| Armor | 4 | 30 | 70 |
| HP | 140 | 1150 | 2600 |
| Mana | 200 | 1400 | 3200 |

#### Specialization 1: Elemental (Fire DPS)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Fireball | Active | Classic fire spell (cast 2.5s) | SP * 2.8 | 0s | 8% Mana | 40yd |
| 2 | Fire Blast | Active | Instant fire damage | SP * 1.5 | 8s | 5% Mana | 40yd |
| 3 | Pyroblast | Active | Massive fire spell (cast 4s) | SP * 4.5 | 0s | 15% Mana | 40yd |
| 4 | Flamestrike | Active | AoE fire at location | SP * 2.0 AoE | 8s | 12% Mana | 40yd |
| 5 | Scorch | Active | Quick fire spell while moving (cast 1.5s) | SP * 1.2 | 0s | 4% Mana | 40yd |
| 6 | Living Bomb | Active | Explosive DoT, spreads on expiration | SP * 0.5/tick + SP*3.0 explosion | 12s | 8% Mana | 40yd |
| 7 | Combustion | Active | All DoTs crit for 10s | Buff | 180s | 0 | Self |
| 8 | Meteor | Active | Call down meteor after 3s | SP * 6.0 AoE | 45s | 20% Mana | 40yd |
| 9 | Dragon's Breath | Active | Cone disorient 4s | SP * 2.0 + CC | 20s | 8% Mana | 12yd cone |
| 10 | Blast Wave | Active | AoE knockback around caster | SP * 2.5 + knockback | 30s | 10% Mana | 8yd |
| 11 | Phoenix Flames | Active | Fire projectile pierces all enemies | SP * 2.0 per target | 30s | 10% Mana | 40yd |
| 12 | Ignite | Passive | Fire crits create a DoT for 40% of damage | Passive | — | — | — |
| 13 | Hot Streak | Passive | 2 fire crits in a row = next Pyroblast is instant | Passive | — | — | — |
| 14 | Firestarter | Passive | Fireball and Pyroblast can be cast while moving | Passive | — | — | — |
| 15 | Cauterize | Passive | Lethal damage instead reduces you to 35% HP (5-min CD) | Passive | — | — | — |
| 16 | Blazing Barrier | Active | Absorb shield that damages melee attackers | SP*2.5 absorb | 25s | 8% Mana | Self |
| 17 | Greater Pyroblast | Active | Slow-cast (6s) that deals massive damage | SP * 8.0 | 60s | 25% Mana | 40yd |
| 18 | Flame On | Active | Fire Blast has 2 additional charges | Buff | 60s | 0 | Self |
| 19 | Conflagration | Passive | Ignite ticks have 10% chance to spread | Passive | — | — | — |
| 20 | Critical Mass | Passive | +10% fire spell crit chance | Passive | — | — | — |
| 21 | Inferno | Ultimate | Rain fire for 8s: massive AoE, enemies burn | SP * 2.0 per tick * 8 | 300s | 40% Mana | 40yd 20yd radius |

#### Specialization 2: Arcane (Arcane DPS)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Arcane Blast | Active | Primary nuke, each cast increases next mana cost by 50% | SP * 2.5 | 0s | 4% Mana | 40yd |
| 2 | Arcane Barrage | Active | Instant, consumes Arcane Charges for +30% damage each | SP * 1.0 + 30%/charge | 3s | 3% Mana | 40yd |
| 3 | Arcane Missiles | Active | Channel: 5 waves of arcane damage | SP * 0.8 * 5 | 0s | 6% Mana | 40yd |
| 4 | Arcane Explosion | Active | AoE around caster, generates Arcane Charge | SP * 1.5 AoE | 0s | 5% Mana | 10yd |
| 5 | Arcane Power | Active | +30% damage, +30% mana cost for 15s | Buff | 90s | 0 | Self |
| 6 | Evocation | Active | Channel: restore 60% mana over 6s | Mana | 90s | 0 | Self |
| 7 | Presence of Mind | Active | Next arcane spell is instant | Buff | 60s | 0 | Self |
| 8 | Arcane Orb | Active | Slow-moving orb deals damage to all it passes through | SP * 3.0 per hit | 20s | 10% Mana | 40yd |
| 9 | Supernova | Active | AoE at target, knocks upward | SP * 2.5 + knockup | 25s | 6% Mana | 40yd |
| 10 | Nether Tempest | Active | DoT on target, deals 50% damage to nearby enemies | SP * 0.3/tick AoE | 0s | 3% Mana | 40yd |
| 11 | Slow | Active | Reduce target movement and attack speed by 50% | Debuff | 12s | 4% Mana | 40yd |
| 12 | Polymorph | Active | Transform target into sheep for 60s | CC | 30s | 8% Mana | 30yd |
| 13 | Counterspell | Active | Interrupt spellcasting, lock school for 8s | Interrupt | 24s | 6% Mana | 40yd |
| 14 | Blink | Active | Teleport forward 20 yards | Mobility | 15s | 2% Mana | Self |
| 15 | Ice Block | Active | Immune to all damage for 10s, frozen in ice | Defensive | 300s | 0 | Self |
| 16 | Mirror Image | Active | Create 3 images that cast spells for 40s | Summon | 120s | 10% Mana | Self |
| 17 | Time Warp | Active | +30% haste for party/raid for 40s | Buff | 300s | 0 | Self |
| 18 | Arcane Familiar | Active | Summon a familiar that attacks and regens mana | Summon | 60s | 8% Mana | Self |
| 19 | Rule of Threes | Passive | At 3 Arcane Charges, next Arcane Blast costs 0 mana | Passive | — | — | — |
| 20 | Clearcasting | Passive | 8% chance Arcane Missiles channel is free | Passive | — | — | — |
| 21 | Arcane Overload | Ultimate | Release all mana as damage: SP * (mana_spent/100) in AoE | SP * variable | 300s | All Mana | 15yd |

#### Specialization 3: Frost (Ice DPS + Control)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Frostbolt | Primary | Chilling bolt, slows by 30% (cast 2.5s) | SP * 2.5 + slow | 0s | 5% Mana | 40yd |
| 2 | Ice Lance | Active | Instant, +400% damage on frozen targets | SP * 1.0 (or SP*5.0) | 0s | 3% Mana | 40yd |
| 3 | Flurry | Active | 3 ice bolts in rapid succession | SP * 1.2 * 3 | 8s | 6% Mana | 40yd |
| 4 | Frozen Orb | Active | Slow-moving orb that damages and chills | SP * 0.8 per tick | 60s | 12% Mana | 40yd |
| 5 | Blizzard | Active | AoE rain of ice for 8s | SP * 0.5 per tick AoE | 8s | 10% Mana | 40yd |
| 6 | Cone of Cold | Active | Cone damage + slow 60% | SP * 2.0 + slow | 12s | 7% Mana | 12yd cone |
| 7 | Ice Nova | Active | Freeze all enemies in place for 4s | SP * 2.0 + root | 25s | 5% Mana | 40yd |
| 8 | Frost Nova | Active | Root nearby enemies for 8s | Root | 30s | 4% Mana | 8yd |
| 9 | Ice Barrier | Active | Absorb shield that slows melee attackers | SP*3.0 absorb + slow | 25s | 8% Mana | Self |
| 10 | Cold Snap | Active | Reset all frost cooldowns | Reset | 300s | 0 | Self |
| 11 | Icy Veins | Active | +30% haste for 20s | Buff | 180s | 0 | Self |
| 12 | Summon Water Elemental | Active | Summon elemental that attacks and can freeze | Summon | 60s | 12% Mana | Self |
| 13 | Glacial Spike | Active | Massive icicle (requires 5 Icicle stacks) | SP * 6.0 | 0s | 8% Mana | 40yd |
| 14 | Ebonbolt | Active | Shadowfrost bolt that generates Brain Freeze | SP * 3.0 | 45s | 10% Mana | 40yd |
| 15 | Ray of Frost | Active | Channel beam: increasing damage over 10s | SP * 1.0→4.0 per tick | 60s | 15% Mana | 40yd |
| 16 | Shimmer | Active | Blink can be cast while casting | Passive | — | — | — |
| 17 | Brain Freeze | Passive | Flurry makes next Frostbolt cast instantly and treat as frozen | Passive | — | — | — |
| 18 | Fingers of Frost | Passive | 15% chance Ice Lance treats target as frozen | Passive | — | — | — |
| 19 | Shatter | Passive | Crit chance +50% on frozen targets | Passive | — | — | — |
| 20 | Thermal Void | Passive | Icy Veins extended by 10s per Ice Lance crit | Passive | — | — | — |
| 21 | Absolute Zero | Ultimate | Channel for 4s, then freeze all enemies in 20yd for 8s + massive damage | SP * 8.0 + root | 300s | 20% Mana | Self 20yd |

---

### 2.6 Necromancer

**Lore:** Necromancers walk the thin line between life and death, commanding the spirits of the fallen and wielding shadow magic. Feared by many, they are nevertheless invaluable in the fight against the Void.

**Role:** DPS (Summoner, Affliction, Bone)

**Resource:** Soul Shards (0-5, generated by abilities, spent on summons and powerful spells)

**Base Stats by Level:**

| Stat | Level 1 | Level 25 | Level 50 |
|---|---|---|---|
| Strength | 6 | 31 | 62 |
| Agility | 8 | 42 | 84 |
| Intellect | 16 | 84 | 168 |
| Spirit | 16 | 84 | 168 |
| Stamina | 8 | 42 | 84 |
| Armor | 4 | 30 | 70 |
| HP | 140 | 1150 | 2600 |
| Mana | 200 | 1400 | 3200 |

#### Specialization 1: Summoner (Minion DPS)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Shadow Bolt | Primary | Shadow damage bolt (cast 2.5s) | SP * 2.5 | 0s | 5% Mana | 40yd |
| 2 | Summon Skeleton | Active | Summon a skeleton warrior | Summon | 10s | 1 Soul Shard | 30yd |
| 3 | Summon Skeletal Mage | Active | Summon a skeleton mage | Summon | 20s | 2 Soul Shards | 30yd |
| 4 | Raise Dead | Active | Raise a powerful undead champion | Summon | 120s | 3 Soul Shards | 30yd |
| 5 | Army of the Dead | Active | Channel 4s, summon 6 ghouls | Summon | 600s | 5 Soul Shards | 30yd |
| 6 | Dark Command | Active | Command minions to focus target | Utility | 0s | 0 | 40yd |
| 7 | Sacrifice | Active | Kill a minion to heal self for 30% max HP | Heal | 30s | 0 | Self |
| 8 | Corpse Explosion | Active | Explode a corpse for AoE shadow damage | SP * 3.0 AoE | 8s | 5% Mana | 30yd |
| 9 | Shadow Bite | Active | Minion ability: shadow chomp | SP * 1.5 | 8s | 0 | Melee |
| 10 | Felstorm | Active | Minion ability: AoE spin | SP * 1.0 per tick AoE | 45s | 0 | 8yd |
| 11 | Death Coil | Active | Shadow damage to enemy OR heal to ally | SP * 2.0 | 8s | 6% Mana | 40yd |
| 12 | Fear | Active | Fear target for 8s | CC | 30s | 8% Mana | 30yd |
| 13 | Howl of Terror | Active | Fear all nearby enemies for 6s | CC AoE | 40s | 10% Mana | 10yd |
| 14 | Shadow Ward | Active | Absorb shadow damage | Absorb | 30s | 6% Mana | Self |
| 15 | Soulburn | Active | Enhance next spell at Soul Shard cost | Buff | 30s | 0 | Self |
| 16 | Unstable Affliction | Active | Shadow DoT, dispelling it silences for 6s | SP * 0.4/tick | 0s | 1 Soul Shard | 40yd |
| 17 | Dark Pact | Active | Sacrifice 20% HP for 40% HP absorb shield | Defensive | 60s | 0 | Self |
| 18 | Summon Demonic Tyrant | Active | Summon a powerful demon for 15s that empowers other minions | Summon | 180s | 3 Soul Shards | 30yd |
| 19 | Fel Domination | Active | Next summon is instant and costs 0 Shards | Buff | 120s | 0 | Self |
| 20 | Grimoire of Service | Passive | Can have 1 additional minion active | Passive | — | — | — |
| 21 | Apocalypse | Ultimate | Summon a massive undead colossus for 30s | Summon | 600s | 5 Soul Shards | 30yd |

#### Specialization 2: Affliction (Shadow DoT DPS)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Shadow Bolt | Primary | Shadow bolt (cast 2.5s) | SP * 2.5 | 0s | 5% Mana | 40yd |
| 2 | Agony | Active | DoT: damage increases over 24s | SP * 0.1→0.8/tick | 0s | 3% Mana | 40yd |
| 3 | Corruption | Active | DoT: shadow damage over 18s | SP * 0.35/tick | 0s | 3% Mana | 40yd |
| 4 | Unstable Affliction | Active | DoT: dispelling silences 6s | SP * 0.45/tick | 0s | 1 Soul Shard | 40yd |
| 5 | Drain Life | Active | Channel: damage enemy, heal self | SP * 1.0/tick | 0s | 3% Mana/sec | 40yd |
| 6 | Seed of Corruption | Active | DoT that explodes for AoE on death or damage threshold | SP * 3.0 AoE | 0s | 8% Mana | 40yd |
| 7 | Haunt | Active | Shadow damage + +15% DoT damage for 12s | SP * 3.0 + debuff | 8s | 1 Soul Shard | 40yd |
| 8 | Phantom Singularity | Active | Shadow vortex at target for 16s | SP * 0.5/tick AoE | 45s | 10% Mana | 40yd |
| 9 | Vile Taint | Active | AoE shadow damage + slow 30% | SP * 2.5 + slow | 20s | 1 Soul Shard | 40yd |
| 10 | Dark Soul: Misery | Active | +30% haste for 20s | Buff | 120s | 0 | Self |
| 11 | Mortal Coil | Active | Horror + heal 20% HP | CC + heal | 45s | 8% Mana | 30yd |
| 12 | Shadowfury | Active | AoE stun 3s at location | Stun | 30s | 8% Mana | 30yd |
| 13 | Amplify Curse | Active | Next curse is 50% stronger | Buff | 60s | 0 | Self |
| 14 | Curse of Exhaustion | Active | Slow target by 50% | Slow | 0s | 3% Mana | 40yd |
| 15 | Curse of Weakness | Active | -20% target physical damage | Debuff | 0s | 3% Mana | 40yd |
| 16 | Nightfall | Passive | Corruption ticks have 4% chance to make Shadow Bolt instant | Passive | — | — | — |
| 17 | Contagion | Passive | Unstable Affliction damage +10% per other DoT on target | Passive | — | — | — |
| 18 | Absolute Corruption | Passive | Corruption is permanent (no duration) | Passive | — | — | — |
| 19 | Drain Soul | Active | Execute: channel on target below 20% HP, +200% damage | SP * 3.0/tick | 0s | 3% Mana/sec | 40yd |
| 20 | Creeping Death | Passive | DoTs tick 15% faster | Passive | — | — | — |
| 21 | Soul Rot | Ultimate | Drain 4 enemies simultaneously for 8s | SP * 2.0/tick * 4 targets | 300s | 2 Soul Shards | 40yd |

#### Specialization 3: Bone (Bone Magic DPS + Shields)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Bone Spear | Primary | Piercing bone projectile | SP * 2.2 | 0s | 4% Mana | 40yd |
| 2 | Bone Shield | Active | Absorb shield from bone fragments | SP*3.0 absorb | 30s | 8% Mana | Self |
| 3 | Bone Spirit | Active | Homing bone projectile | SP * 2.8 | 12s | 1 Soul Shard | 40yd |
| 4 | Bone Armor | Active | +30% armor for 20s | Buff | 60s | 6% Mana | Self |
| 5 | Corpse Lance | Active | Fire bone shards from a corpse | SP * 3.0 AoE | 8s | 5% Mana | 30yd |
| 6 | Skeletal Archer | Active | Summon bone archers | Summon | 20s | 2 Soul Shards | 30yd |
| 7 | Bone Prison | Active | Trap target in bones for 6s | CC | 45s | 1 Soul Shard | 30yd |
| 8 | Bone Storm | Active | AoE bone tornado for 10s | SP * 0.6/tick AoE | 60s | 10% Mana | 10yd |
| 9 | Siphon Life | Active | DoT that heals you | SP * 0.3/tick + heal | 0s | 4% Mana | 40yd |
| 10 | Death's Caress | Active | Bone shield on ally | Absorb | 20s | 6% Mana | 40yd |
| 11 | Bone Armor (Passive) | Passive | +10% base armor | Passive | — | — | — |
| 12 | Grim Scythe | Active | AoE melee attack with bone scythe | SP * 2.0 AoE | 10s | 0 | 8yd |
| 13 | Land of the Dead | Active | Raise skeletons from ground for 15s | Summon | 120s | 2 Soul Shards | 40yd |
| 14 | Simulacrum | Active | Create a copy of yourself that casts 50% damage | Summon | 180s | 2 Soul Shards | Self |
| 15 | Blood Rush | Active | Teleport through enemies, leaving a blood trail | Mobility | 12s | 3% Mana | 30yd |
| 16 | Devour | Active | Consume a corpse for 10% HP + mana | Restore | 8s | 0 | 30yd |
| 17 | Decrepify | Active | Slow + reduce damage by 15% | Debuff | 15s | 4% Mana | 30yd |
| 18 | Bone Spear (Enhanced) | Passive | Bone Spear pierces through enemies | Passive | — | — | — |
| 19 | Stand Alone | Passive | +20% armor when no minions active | Passive | — | — | — |
| 20 | Bone Prison (Passive) | Passive | Enemies killed near you have 20% chance to spawn a skeleton | Passive | — | — | — |
| 21 | Army of the Damned | Ultimate | Raise a massive skeleton army (20 units) for 30s | Summon | 600s | 5 Soul Shards | 40yd |

---

### 2.7 Cleric

**Lore:** Clerics are divine conduits, channeling the power of the Aether to heal the wounded, protect the innocent, and smite the unholy. They are the backbone of any group, keeping allies alive through the darkest battles.

**Role:** Healer (Holy, Discipline) / DPS (Judgement)

**Resource:** Mana (0-max) + Holy Power (0-5, generated by healing spells)

**Base Stats by Level:**

| Stat | Level 1 | Level 25 | Level 50 |
|---|---|---|---|
| Strength | 8 | 42 | 84 |
| Agility | 6 | 31 | 62 |
| Intellect | 14 | 73 | 147 |
| Spirit | 18 | 95 | 190 |
| Stamina | 12 | 63 | 126 |
| Armor | 10 | 80 | 190 |
| HP | 180 | 1500 | 3400 |
| Mana | 220 | 1550 | 3500 |

#### Specialization 1: Holy (Healer)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Flash Heal | Active | Fast heal (cast 1.5s) | SP * 2.5 | 0s | 10% Mana | 40yd |
| 2 | Greater Heal | Active | Powerful heal (cast 3s) | SP * 5.0 | 0s | 18% Mana | 40yd |
| 3 | Heal | Active | Standard heal (cast 2.5s) | SP * 3.5 | 0s | 12% Mana | 40yd |
| 4 | Renew | Active | Heal over time for 12s | SP * 0.5/tick | 0s | 6% Mana | 40yd |
| 5 | Prayer of Healing | Active | Heal 5 nearby allies | SP * 2.0 each | 8s | 20% Mana | 40yd |
| 6 | Circle of Healing | Active | Heal 5 injured allies at target location | SP * 2.5 each | 10s | 15% Mana | 40yd |
| 7 | Holy Word: Serenity | Active | Instant powerful heal + HoT | SP * 3.0 + HoT | 12s | 1 Holy Power | 40yd |
| 8 | Holy Word: Sanctify | Active | AoE heal at location | SP * 2.0 AoE | 18s | 1 Holy Power | 40yd |
| 9 | Divine Hymn | Active | Channel: heal all party/raid for 8s | SP * 3.0 per tick | 300s | 25% Mana | 40yd |
| 10 | Guardian Spirit | Active | If target dies within 10s, resurrect with 40% HP | Buff | 180s | 6% Mana | 40yd |
| 11 | Prayer of Mending | Active | Heals on next damage taken, then bounces to next ally | SP * 2.0 per bounce | 0s | 8% Mana | 40yd |
| 12 | Leap of Faith | Active | Pull ally to your location | Utility | 90s | 6% Mana | 40yd |
| 13 | Purify | Active | Remove 1 disease and 1 magic debuff | Dispel | 8s | 6% Mana | 40yd |
| 14 | Mass Dispel | Active | Dispel all allies in area | Dispel AoE | 45s | 20% Mana | 30yd |
| 15 | Holy Fire | Active | Deal holy damage (cast 2s) | SP * 2.5 | 8s | 6% Mana | 30yd |
| 16 | Smite | Active | Basic holy damage (cast 1.5s) | SP * 1.5 | 0s | 3% Mana | 30yd |
| 17 | Symbol of Hope | Active | Regenerate 10% mana over 10s for all allies | Buff | 300s | 0 | 40yd |
| 18 | Benediction | Passive | Renew has 15% chance to spread to nearby ally | Passive | — | — | — |
| 19 | Surge of Light | Passive | Flash Heal crits make next Flash Heal instant | Passive | — | — | — |
| 20 | Holy Concentration | Passive | After a crit heal, +10% mana regen for 8s | Passive | — | — | — |
| 21 | Salvation | Ultimate | Heal all allies to full HP in 40yd | Full Heal | 600s | 30% Mana | 40yd |

#### Specialization 2: Discipline (Healer via Damage)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Penance | Active | Channel 4 holy bolts (damage enemy OR heal ally) | SP * 1.0 * 4 | 9s | 8% Mana | 40yd |
| 2 | Shadow Mend | Active | Heal, but target takes damage over 10s for 50% of heal | SP * 3.0 | 0s | 8% Mana | 40yd |
| 3 | Power Word: Shield | Active | Absorb shield for 15s | SP*3.5 absorb | 6s | 7% Mana | 40yd |
| 4 | Atonement | Passive | Your damage heals allies with Atonement for 40% | Passive | — | — | — |
| 5 | Power Word: Radiance | Active | Heal + apply Atonement to 5 allies | SP * 1.8 each | 15s | 15% Mana | 30yd |
| 6 | Rapture | Active | Power Word: Shield has no CD for 8s | Buff | 120s | 0 | Self |
| 7 | Evangelism | Active | Extend all Atonements by 6s | Buff | 90s | 0 | Self |
| 8 | Schism | Active | +20% damage on target for 9s | Debuff | 24s | 5% Mana | 40yd |
| 9 | Mind Blast | Active | Shadow damage | SP * 2.5 | 7.5s | 4% Mana | 40yd |
| 10 | Smite | Active | Holy damage | SP * 1.5 | 0s | 3% Mana | 30yd |
| 11 | Purify | Active | Dispel | Dispel | 8s | 6% Mana | 40yd |
| 12 | Mass Dispel | Active | AoE dispel | Dispel AoE | 45s | 20% Mana | 30yd |
| 13 | Pain Suppression | Active | -40% damage taken for 8s on target | Defensive | 180s | 6% Mana | 40yd |
| 14 | Barrier of Faith | Active | Absorb shield on party for 10s | Absorb | 120s | 12% Mana | 30yd |
| 15 | Shadow Word: Death | Active | Execute: damage self and enemy | SP * 3.0 (self dmg) | 8s | 5% Mana | 40yd |
| 16 | Mindbender | Active | Summon mindbender that attacks and regens mana | Summon | 60s | 0 | 40yd |
| 17 | Power Infusion | Active | +25% haste for 20s on target | Buff | 120s | 0 | 40yd |
| 18 | Twist of Fate | Passive | +20% damage/healing on targets below 35% HP | Passive | — | — | — |
| 19 | Castigation | Passive | Penance fires 1 additional bolt | Passive | — | — | — |
| 20 | Lenience | Passive | Atonement reduces damage taken by 3% per Atonement | Passive | — | — | — |
| 21 | Ultimate Sacrifice | Ultimate | Absorb all damage from allies for 10s (may kill you) | Absorb | 600s | 0 | 40yd |

#### Specialization 3: Judgement (DPS — Holy + Shadow)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Holy Smite | Active | Enhanced smite (cast 2s) | SP * 2.8 | 0s | 5% Mana | 30yd |
| 2 | Shadow Word: Pain | Active | Shadow DoT for 18s | SP * 0.4/tick | 0s | 3% Mana | 40yd |
| 3 | Holy Fire | Active | Holy damage + DoT | SP * 2.5 + SP*0.2/tick | 8s | 6% Mana | 30yd |
| 4 | Mind Sear | Active | AoE shadow damage channel | SP * 0.6/tick AoE | 0s | 5% Mana/sec | 40yd |
| 5 | Divine Star | Active | Arc of holy damage in front, returns | SP * 2.0 * 2 passes | 15s | 5% Mana | 24yd |
| 6 | Halo | Active | Expanding ring of holy damage/healing | SP * 3.0 | 40s | 10% Mana | 30yd |
| 7 | Chastise | Active | Stun target 4s | SP * 2.0 + stun | 30s | 8% Mana | 30yd |
| 8 | Holy Word: Chastise | Active | Holy damage + incapacitate 5s | SP * 3.5 + CC | 60s | 1 Holy Power | 30yd |
| 9 | Shadowfiend | Active | Summon shadow creature for 15s that attacks and regens mana | Summon | 180s | 0 | 40yd |
| 10 | Vampiric Embrace | Active | 20% of damage done heals allies for 15s | Buff | 120s | 0 | Self |
| 11 | Silence | Active | Silence target for 5s | Interrupt | 45s | 0 | 30yd |
| 12 | Psychic Scream | Active | Fear nearby enemies for 8s | CC | 30s | 6% Mana | 8yd |
| 13 | Dispel Magic | Active | Remove 1 magic buff from enemy | Dispel | 0s | 4% Mana | 30yd |
| 14 | Leap of Faith | Active | Pull ally to you | Utility | 90s | 6% Mana | 40yd |
| 15 | Angelic Feather | Active | Place feather, ally who touches it gets +40% speed for 5s | Utility | 20s | 3% Mana | 40yd |
| 16 | Body and Soul | Passive | Power Word: Shield gives +40% speed for 3s | Passive | — | — | — |
| 17 | Twist of Fate | Passive | +20% damage on targets below 35% HP | Passive | — | — | — |
| 18 | Shadow Word: Death (Enhanced) | Passive | If SW:D doesn't kill, cooldown is reset | Passive | — | — | — |
| 19 | Searing Light | Passive | Holy Fire reduces Smite cast time by 0.5s | Passive | — | — | — |
| 20 | Purge the Wicked | Passive | Holy Fire also applies a DoT | Passive | — | — | — |
| 21 | Archangel | Ultimate | Ascend for 15s: +30% damage, +30% healing, flight | Buff | 300s | 0 | Self |

---

### 2.8 Druid

**Lore:** Druids are guardians of nature, wielding the primal forces of the wild. They can shapeshift into different forms, channel the power of the moon and sun, and mend wounds with nature's restorative energy.

**Role:** Healer (Restoration) / DPS (Feral, Balance) / Tank (Feral — Guardian form)

**Resource:** Mana (Balance/Restoration) or Energy (Feral) + Combo Points (Feral)

**Base Stats by Level:**

| Stat | Level 1 | Level 25 | Level 50 |
|---|---|---|---|
| Strength | 10 | 52 | 105 |
| Agility | 10 | 52 | 105 |
| Intellect | 14 | 73 | 147 |
| Spirit | 16 | 84 | 168 |
| Stamina | 12 | 63 | 126 |
| Armor | 8 | 65 | 150 |
| HP | 170 | 1400 | 3200 |
| Mana | 200 | 1400 | 3200 |

#### Specialization 1: Balance (Ranged DPS — Arcane/Nature)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Solar Wrath | Active | Nature bolt (cast 2s) | SP * 2.2 | 0s | 4% Mana | 40yd |
| 2 | Lunar Strike | Active | Arcane bolt (cast 2.5s), hits 3 targets | SP * 2.8 each | 0s | 8% Mana | 40yd |
| 3 | Moonfire | Active | Arcane DoT for 18s | SP * 0.3/tick | 0s | 3% Mana | 40yd |
| 4 | Sunfire | Active | Nature DoT for 12s, spreads on application | SP * 0.35/tick | 0s | 3% Mana | 40yd |
| 5 | Starsurge | Active | Instant arcane damage, generates Astral Power | SP * 3.0 | 10s | 6% Mana | 40yd |
| 6 | Starfall | Active | AoE arcane rain for 8s (costs Astral Power) | SP * 0.8/tick AoE | 0s | 50 AP | 40yd |
| 7 | Celestial Alignment | Active | Both Eclipses active for 20s | Buff | 180s | 0 | Self |
| 8 | Convoke the Spirits | Active | Channel: cast 10 random spells over 4s | Random spells | 180s | 10% Mana | Self |
| 9 | Force of Nature | Active | Summon 3 treants for 10s | Summon | 60s | 8% Mana | 40yd |
| 10 | Barkskin | Active | -20% damage taken for 12s | Defensive | 60s | 0 | Self |
| 11 | Solar Beam | Active | Silence + interrupt at target location | Interrupt | 60s | 0 | 40yd |
| 12 | Entangling Roots | Active | Root target for 30s | CC | 12s | 5% Mana | 35yd |
| 13 | Mass Entanglement | Active | Root all enemies in area | CC AoE | 30s | 8% Mana | 35yd |
| 14 | Typhoon | Active | Knockback all enemies in front | Knockback | 30s | 0 | 15yd |
| 15 | Wild Charge | Active | Various movement based on form | Mobility | 15s | 0 | Variable |
| 16 | Tiger Dash | Active | +200% speed for 2s, then +60% for 5s | Buff | 120s | 0 | Self |
| 17 | Incarnation: Chosen of Elune | Active | Moonkin form enhanced for 30s | Buff | 180s | 0 | Self |
| 18 | Warrior of Elune | Active | Next 3 Lunar Strikes are instant | Buff | 45s | 0 | Self |
| 19 | Starlord | Passive | Starsurge reduces cast time of next Solar Wrath/Lunar Strike by 10% | Passive | — | — | — |
| 20 | Stellar Innervation | Passive | Starfall extends Moonfire/Sunfire duration | Passive | — | — | — |
| 21 | Celestial Convergence | Ultimate | All DoTs on all nearby enemies explode for remaining damage | SP * variable | 300s | 100 AP | 40yd |

#### Specialization 2: Feral (Melee DPS — Cat Form)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Shred | Active | Primary attack (enhanced from stealth) | AGI * 1.5 | 0s | 40 Energy | Melee |
| 2 | Rake | Active | Bleed + 1 CP | AGI * 0.3/tick for 15s | 0s | 35 Energy | Melee |
| 3 | Rip | Active | Finisher: bleed (CP-scaled) | AGI * 0.25/tick * CP | 0s | 30 Energy | Melee |
| 4 | Ferocious Bite | Active | Finisher: instant damage (CP-scaled) | AGI * 2.5 * CP | 0s | 25 Energy | Melee |
| 5 | Swipe | Active | AoE attack | AGI * 1.0 AoE | 0s | 35 Energy | 8yd |
| 6 | Thrash | Active | AoE bleed | AGI * 0.2/tick AoE | 0s | 40 Energy | 8yd |
| 7 | Maim | Active | Finisher: stun (CP-scaled, 1-6s) | Stun | 10s | 30 Energy | Melee |
| 8 | Berserk | Active | -50% Energy cost for 15s | Buff | 180s | 0 | Self |
| 9 | Tiger's Fury | Active | +15% damage for 10s + 50 Energy | Buff | 30s | 0 | Self |
| 10 | Incarnation: King of the Jungle | Active | Enhanced cat form for 30s, stealth in combat | Buff | 180s | 0 | Self |
| 11 | Prowl | Active | Enter stealth | Stealth | 0s | 0 | Self |
| 12 | Pounce | Active | Stun 4s from stealth | Stun | 0s | 50 Energy | Melee |
| 13 | Ravage | Active | High damage from stealth, 2 CP | AGI * 3.0 | 0s | 60 Energy | Melee |
| 14 | Feral Frenzy | Active | Rapid strikes over 6s, 5 CP | AGI * 0.5 * 6 | 45s | 25 Energy | Melee |
| 15 | Survival Instincts | Active | -50% damage taken for 6s | Defensive | 180s | 0 | Self |
| 16 | Barkskin | Active | -20% damage taken for 12s | Defensive | 60s | 0 | Self |
| 17 | Dash | Active | +70% speed for 10s | Buff | 120s | 0 | Self |
| 18 | Skull Bash | Active | Charge + interrupt | Interrupt | 15s | 0 | 13yd |
| 19 | Bloodtalons | Passive | Healing Touch makes next 2 Shreds/Rakes +30% damage | Passive | — | — | — |
| 20 | Savage Roar | Passive | Finisher: +15% damage for 12-24s (CP-scaled) | Passive | — | — | — |
| 21 | Apex Predator | Ultimate | Enter Primal Form: all abilities cost 0 Energy for 12s | Buff | 300s | 0 | Self |

#### Specialization 3: Restoration (Healer)
| # | Ability | Type | Description | Formula | Cooldown | Cost | Range |
|---|---|---|---|---|---|---|---|
| 1 | Healing Touch | Active | Powerful heal (cast 2.5s) | SP * 4.5 | 0s | 12% Mana | 40yd |
| 2 | Rejuvenation | Active | HoT for 12s | SP * 0.5/tick | 0s | 5% Mana | 40yd |
| 3 | Regrowth | Active | Fast heal + HoT (cast 1.5s) | SP * 2.0 + SP*0.2/tick | 0s | 8% Mana | 40yd |
| 4 | Lifebloom | Active | HoT on target, blooms for heal when expires or dispelled | SP * 0.4/tick + SP*3.0 bloom | 0s | 6% Mana | 40yd |
| 5 | Wild Growth | Active | Heal 5 injured allies over 7s | SP * 0.6/tick each | 10s | 14% Mana | 40yd |
| 6 | Swiftmend | Active | Instant heal (consumes a HoT) | SP * 4.0 | 15s | 8% Mana | 40yd |
| 7 | Tranquility | Active | Channel: heal all allies for 8s | SP * 3.0 per tick | 300s | 25% Mana | 40yd |
| 8 | Ironbark | Active | -20% damage taken on target for 12s | Defensive | 90s | 6% Mana | 40yd |
| 9 | Barkskin | Active | -20% damage taken for 12s | Defensive | 60s | 0 | Self |
| 10 | Nature's Cure | Active | Remove 1 magic, 1 poison, 1 curse | Dispel | 8s | 6% Mana | 40yd |
| 11 | Innervate | Active | Target's spells cost 0 mana for 10s | Buff | 180s | 0 | 40yd |
| 12 | Efflorescence | Active | Place mushroom that heals allies in area for 30s | SP * 0.4/tick AoE | 30s | 10% Mana | 40yd |
| 13 | Cenarion Ward | Active | HoT triggered by damage taken | SP * 0.8/tick | 30s | 8% Mana | 40yd |
| 14 | Wild Charge | Active | Various movement by form | Mobility | 15s | 0 | Variable |
| 15 | Incarnation: Tree of Life | Active | Enhanced restoration form for 30s | Buff | 180s | 0 | Self |
| 16 | Flourish | Active | Extend all active HoTs by 8s | Buff | 60s | 0 | Self |
| 17 | Overgrowth | Active | Apply Rejuvenation, Regrowth, Lifebloom, and Wild Growth | Multi-HoT | 60s | 20% Mana | 40yd |
| 18 | Nature's Swiftness | Active | Next nature spell is instant | Buff | 60s | 0 | Self |
| 19 | Soul of the Forest | Passive | Swiftmend makes next spell 50% more effective | Passive | — | — | — |
| 20 | Germination | Passive | Rejuvenation can have 2 applications on same target | Passive | — | — | — |
| 21 | Essence of G'Hanir | Ultimate | All HoTs tick twice as fast for 15s | Buff | 300s | 0 | Self |

---

## 3. SKILL TREES

Each class has 3 specializations, each with a skill tree of 30 nodes arranged in 6 tiers.

### Skill Tree Layout
```
Tier 1 (5 nodes) → Tier 2 (5 nodes) → Tier 3 (5 nodes) → Tier 4 (5 nodes) → Tier 5 (5 nodes) → Tier 6 (5 nodes)

Each tier requires spending points in previous tiers:
- Tier 1: 0 points required
- Tier 2: 5 points required
- Tier 3: 10 points required
- Tier 4: 15 points required
- Tier 5: 20 points required
- Tier 6: 25 points required

Maximum skill points: 30 (1 per level from 15-44)
```

### Node Types
- **Major Node:** Significant ability enhancement or new mechanic (1 per tier, center position)
- **Minor Node:** Stat boost or passive effect (2 per tier, side positions)
- **Choice Node:** Pick one of two options (replaces Minor in some tiers)

### Example: Warrior — Gladiator Tree

**Tier 1:**
- [Minor] +5% Strength
- [Minor] +3% Critical Strike
- [Major] Improved Slash: Slash has 15% chance to make next Rend free
- [Minor] +5% Attack Power
- [Minor] +2% Haste

**Tier 2:**
- [Choice] Bloodsurge (Raging Blow crits refund 10 Rage) OR Unbridled Fury (+10% damage while Enraged)
- [Minor] +8% Rend damage
- [Major] Improved Mortal Strike: Mortal Strike also applies a 10% healing reduction debuff to nearby enemies
- [Minor] +5% damage to targets below 35% HP
- [Choice] Fresh Meat (Bloodthirst always crits on first use) OR Massacre (Execute usable at 35% HP)

**Tier 3:**
- [Minor] +10% Critical Strike damage
- [Major] Bladestorm Enhancement: While Bladestorming, you reflect all spells
- [Minor] +5% max HP
- [Minor] -10% damage taken while casting Whirlwind
- [Choice] Storm of Swords (Whirlwind hits 2 additional targets) OR Merciless (Execute refunds 20 Rage on kill)

**Tier 4:**
- [Major] Warbreaker Enhancement: Warbreaker also applies Mortal Strike debuff
- [Minor] +8% auto-attack damage
- [Choice] Fervor of Battle (Whirlwind during Bladestorm) OR Reckless Abandon (Recklessness also grants 100 Rage)
- [Minor] +5% Leech (heal for % of damage done)
- [Major] Sudden Death: Auto-attacks have 10% chance to reset Execute cooldown and make it usable at any HP

**Tier 5:**
- [Minor] +15% Execute damage
- [Major] Ravager Enhancement: Ravager follows your target and slows by 50%
- [Choice] Siegebreaker (ability) OR Unhinged (Mortal Strike automatically fires during Bladestorm)
- [Minor] +10% damage to stunned targets
- [Minor] -15% Charge cooldown

**Tier 6:**
- [Major] **Bladestorm of Destruction:** Bladestorm now deals 200% increased damage, pulls enemies in, and can be cancelled early for a powerful AoE slam
- [Minor] +10% Strength, +10% Stamina
- [Major] **Warlord's Challenge:** Challenge an enemy to a duel for 6s. You both deal +30% damage to each other. Winner gains +20% damage for 30s.
- [Minor] +5% Versatility
- [Major] **Unstoppable Fury:** While above 80% Rage, you are immune to crowd control and deal +15% damage

---

## 4. PROFESSIONS

### 4.1 Gathering Professions

#### Herbalism
**Resource Type:** Herbs (used by Alchemy, Cooking)
**Tool Required:** Herbalist's Sickle
**Skill Range:** 1-300

**Herb Tiers:**

| Skill | Herb | Zone | Respawn |
|---|---|---|---|
| 1-50 | Peacebloom | Starter zones | 5 min |
| 25-75 | Silverleaf | Starter zones | 5 min |
| 50-100 | Mageroyal | Low-level zones | 6 min |
| 75-125 | Briarthorn | Low-level zones | 6 min |
| 100-150 | Swiftthistle | Mid-level zones | 7 min |
| 125-175 | Bruiseweed | Mid-level zones | 7 min |
| 150-200 | Wild Steelbloom | High-level zones | 8 min |
| 175-225 | Grave Moss | High-level zones | 8 min |
| 200-250 | Sungrass | End-game zones | 10 min |
| 225-275 | Dreamfoil | End-game zones | 10 min |
| 250-300 | Black Lotus | Rare spawn (all zones) | 30 min |

**Special Abilities:**
- *Find Herbs:* Minimap shows herb nodes within 40yd
- *Herbalist's Touch:* 10% chance to harvest double herbs
- *Living Action:* Herbs have a 5% chance to grant a random buff when harvested

#### Mining
**Resource Type:** Ores & Stones (used by Blacksmithing, Engineering)
**Tool Required:** Mining Pick
**Skill Range:** 1-300

**Ore Tiers:**

| Skill | Ore | Zone | Respawn |
|---|---|---|---|
| 1-50 | Copper Ore | Starter zones | 5 min |
| 25-75 | Tin Ore | Starter zones | 5 min |
| 50-100 | Iron Ore | Low-level zones | 6 min |
| 75-125 | Silver Ore | Low-level zones | 8 min |
| 100-150 | Gold Ore | Mid-level zones | 8 min |
| 125-175 | Mithril Ore | Mid-level zones | 8 min |
| 150-200 | Thorium Ore | High-level zones | 10 min |
| 175-225 | Truesilver Ore | High-level zones | 12 min |
| 200-250 | Adamantite Ore | End-game zones | 10 min |
| 225-275 | Fel Iron Ore | End-game zones | 10 min |
| 250-300 | Khorium Ore | Rare spawn | 30 min |

**Special Abilities:**
- *Find Minerals:* Minimap shows ore nodes within 40yd
- *Toughness:* +5% Stamina while mining
- *Smelt:* Convert raw ore into bars at a forge

#### Skinning
**Resource Type:** Hides & Leather (used by Tailoring, Cooking)
**Tool Required:** Skinning Knife
**Skill Range:** 1-300

**Skinning requires killing beasts/animals first.**
- Skill determines quality of hide obtained
- Higher-skill beasts require higher Skinning skill
- *Master Skinner:* 15% chance to obtain a pristine hide (double value)

### 4.2 Crafting Professions

#### Alchemy
**Creates:** Potions, Elixirs, Flasks, Transmutations
**Tool Required:** Alchemist's Bench
**Skill Range:** 1-300

**Quality System:**
- Normal: Base stats
- Superior (+5 skill): +10% effect
- Exceptional (+10 skill): +25% effect
- Masterwork (+15 skill): +50% effect, unique visual

**Key Recipes:**

| Skill | Recipe | Materials | Effect |
|---|---|---|---|
| 1 | Minor Health Potion | 1 Peacebloom, 1 Silverleaf | Restore 200 HP |
| 50 | Health Potion | 2 Briarthorn, 1 Mageroyal | Restore 600 HP |
| 100 | Greater Health Potion | 3 Bruiseweed, 2 Swiftthistle | Restore 1500 HP |
| 150 | Superior Health Potion | 4 Wild Steelbloom, 3 Grave Moss | Restore 3000 HP |
| 200 | Major Health Potion | 5 Sungrass, 4 Dreamfoil | Restore 5000 HP |
| 250 | Mythic Health Potion | 6 Black Lotus, 5 Dreamfoil | Restore 8000 HP |
| 75 | Elixir of Fortitude | 2 Briarthorn, 1 Mageroyal | +50 HP for 1 hour |
| 150 | Elixir of Agility | 3 Wild Steelbloom, 2 Swiftthistle | +15 Agility for 1 hour |
| 200 | Flask of the Titans | 5 Sungrass, 3 Dreamfoil, 1 Black Lotus | +100 Stamina for 2 hours (persists through death) |
| 250 | Flask of Supreme Power | 6 Dreamfoil, 2 Black Lotus | +80 Intellect for 2 hours |
| 175 | Transmute: Iron to Gold | 1 Iron Ore | 1 Gold Ore (20-hour CD) |
| 225 | Transmute: Primal Fire to Water | 1 Primal Fire | 1 Primal Water (20-hour CD) |

**Discovery System:** 5% chance when crafting any recipe to discover a new, more powerful variant.

#### Blacksmithing
**Creates:** Plate armor, Mail armor, Weapons (swords, axes, maces, daggers)
**Tool Required:** Anvil + Forge
**Skill Range:** 1-300

**Key Recipes:**

| Skill | Recipe | Materials | Stats |
|---|---|---|---|
| 1 | Copper Bracers | 4 Copper Bars | +5 Armor |
| 50 | Iron Gauntlets | 8 Iron Bars | +15 Armor, +3 Strength |
| 100 | Steel Breastplate | 12 Steel Bars | +35 Armor, +8 Strength |
| 150 | Mithril Helm | 15 Mithril Bars | +55 Armor, +12 Strength, +8 Stamina |
| 200 | Thorium Leggings | 20 Thorium Bars | +80 Armor, +18 Strength, +15 Stamina |
| 250 | Adamantite Plate Set | 30 Adamantite Bars | +120 Armor, +25 Strength, +20 Stamina, +10% block |
| 175 | Mithril Longsword | 12 Mithril Bars, 2 Leather | 45-67 damage, +10 Strength |
| 225 | Thorium Greatsword | 20 Thorium Bars, 4 Leather | 78-117 damage, +18 Strength, +12 Stamina |
| 275 | Felsteel Reaper | 25 Fel Iron Bars, 8 Khorium Bars | 120-180 damage, +30 Strength, +20 Stamina, +5% crit |

**Specializations:** At skill 200, choose: Armorsmith (enhanced armor recipes) or Weaponsmith (enhanced weapon recipes)

#### Tailoring
**Creates:** Cloth armor, Bags, Enchanting materials
**Tool Required:** Loom
**Skill Range:** 1-300

#### Engineering
**Creates:** Gadgets, Trinkets, Ammunition, Explosives, Mounts
**Tool Required:** Engineer's Workbench
**Skill Range:** 1-300

**Unique Items:**
- *Gnomish Mind Control Cap:* Mind control target for 10s (PvP)
- *Goblin Sapper Charge:* AoE damage, damages self
- *Mechano-Hog:* Engineering-only mount
- *Arcanite Dragonling:* Summon a mechanical dragon for 1 minute

### 4.3 Cooking & Fishing

#### Cooking
**Creates:** Food (out-of-combat healing), Buff foods
**Skill Range:** 1-300

**Key Recipes:**

| Skill | Recipe | Materials | Effect |
|---|---|---|---|
| 1 | Simple Bread | 1 Flour | Restore 100 HP over 20s |
| 50 | Herb-Roasted Chicken | 1 Raw Chicken, 1 Mageroyal | Restore 300 HP, +3 Spirit for 30 min |
| 100 | Spiced Wolf Steak | 1 Wolf Meat, 1 Mild Spices | Restore 600 HP, +8 Strength for 30 min |
| 150 | Grilled Dragonfish | 1 Dragonfish | Restore 1000 HP, +12 Intellect for 30 min |
| 200 | Feast of the Wild | 5 Mixed Meats, 3 Rare Spices | Restore 2000 HP, +20 to all stats for 1 hour |
| 250 | Banquet of the Elements | 10 Primal Meats, 5 Rare Spices | Restore 4000 HP, +35 to all stats for 1 hour |

#### Fishing
**Creates:** Raw fish (for Cooking), Treasure, Junk
**Tool Required:** Fishing Rod
**Skill Range:** 1-300

**Fishing Locations:**
- Ponds in starter zones (skill 1-50)
- Rivers in mid-level zones (skill 50-150)
- Lakes in high-level zones (skill 150-250)
- Ocean/deep water in end-game (skill 250-300)
- Special fishing holes (rare, best fish)

**Treasure Catches:**
- Locked Chests (contain gold and items)
- Recipe scrolls
- Rare crafting materials
- Companion pets

### 4.4 Recipe Discovery
- **Trainers:** Teach base recipes up to skill 200
- **World Drops:** Recipes found from monsters, chests, and quests
- **Discovery:** 5% chance when crafting to find a new recipe
- **Reputation Vendors:** Faction-specific recipes at Honored/Revered/Exalted
- **Dungeon Drops:** Rare recipes from dungeon bosses

### 4.5 Crafting Quality
Quality is determined by skill level relative to recipe difficulty:
- **Normal:** Skill within 0-4 of recipe level
- **Superior:** Skill 5-9 above recipe level
- **Exceptional:** Skill 10-14 above recipe level
- **Masterwork:** Skill 15+ above recipe level

Higher quality increases stats by 10%/25%/50% respectively.

---

## 5. ECONOMY

### 5.1 Currency System

| Currency | Source | Cap | Use |
|---|---|---|---|
| Gold | Quests, vendors, drops, trading | None | Primary currency |
| Valor Tokens | Daily/weekly quests, dungeons | 2000/week | Gear upgrades, recipes |
| Honor Points | PvP activities | 5000 | PvP gear, consumables |
| Premium Coins | Real money purchase only | None | Cosmetic shop ONLY |
| Guild Commendation | Guild activities | 1000 | Guild perks, recipes |
| Reputation Tokens | Faction quests/events | Varies per faction | Faction vendors |

### 5.2 Auction House

**Listing Rules:**
- Max 20 active listings per character
- Listing fee: 5% of buyout price (minimum 1 silver)
- Duration: 12h, 24h, or 48h
- Deposit returned if item sells
- 5% sales tax on successful sale

**Search Filters:**
- Item type, rarity, level range
- Stat requirements
- Price range
- Name search (partial match)
- Sort by: price, time remaining, item level

**Anti-Manipulation:**
- Minimum listing price: vendor sell price * 2
- Cannot list items below vendor buy price
- Price history available (last 30 days)
- Automated detection of suspicious trading patterns

### 5.3 Player Trading

**Trade Window:**
- Both players must be within 10 yards
- Max 10 items per trade
- Gold amount shown to both parties
- 5-second confirmation timer after both click "Accept"
- Either party can cancel during confirmation
- Trade history logged for moderation

### 5.4 Item Rarity & Stats

| Rarity | Color | Drop Rate | Stat Budget | Upgrade Levels |
|---|---|---|---|---|
| Common | White | 60% | 100% | 0 |
| Uncommon | Green | 25% | 130% | 2 |
| Rare | Blue | 10% | 170% | 4 |
| Epic | Purple | 4% | 220% | 6 |
| Legendary | Orange | 0.9% | 300% | 8 |
| Mythic | Gold | 0.1% | 400% | 10 |

**Item Level Formula:**
```
base_stats = item_level * rarity_multiplier * class_weights
```

### 5.5 Gear Progression

**Item Level Tiers:**

| Content | iLevel Range |
|---|---|
| Level 1-10 questing | 1-20 |
| Level 10-20 questing | 20-40 |
| Level 20-30 questing | 40-65 |
| Level 30-40 dungeons | 65-100 |
| Level 40-50 dungeons | 100-140 |
| Heroic Dungeons | 140-170 |
| Mythic Dungeons | 170-200 |
| Normal Raids | 200-230 |
| Heroic Raids | 230-260 |
| Mythic Raids | 260-300 |

### 5.6 Enchanting & Socketing

**Enchanting (profession):**
- Enchant weapons with elemental damage, lifesteal, stat bonuses
- Enchant armor with stat bonuses, resistances, utility effects
- Materials: Disenchant unwanted items → essences, dusts, shards

**Gem Socketing:**
- Epic+ items have 1-3 gem sockets
- Gems provide: +Primary stat, +Secondary stat, +Resistance
- Meta Gems: powerful effects requiring specific gem color combinations
- Socket Bonus: matching all socket colors grants a bonus stat

### 5.7 Gold Sinks

| Sink | Cost | Purpose |
|---|---|---|
| Gear Repair | Varies by iLevel | Maintain equipment durability |
| Auction House Fees | 5% listing + 5% sale | Market regulation |
| Mount Training | 50-500g | Mount speed upgrades |
| Housing | 500-5000g | Purchase and furnish |
| Guild Creation | 100g | Guild establishment |
| Flight Paths | Varies by distance | Fast travel |
| Transmogrification | 50-200g | Change item appearance |
| Bank Slots | 10-500g per tab | Additional storage |

---

## 6. PvE SYSTEMS

### 6.1 Quest Types

**Main Story Quests** (50+ quests):
- Chain through all 6 regions
- Unlock key features (mounts, dungeons, crafting)
- Major lore revelations
- Unique rewards (gear, titles, abilities)

**Side Quests** (200+ total):
- Zone-specific stories
- Optional but rewarding
- Various objectives: kill, collect, escort, explore, puzzle

**Daily Quests** (20 per day):
- Rotate between zones
- Reward: Gold, Valor Tokens, Reputation
- Reset at 04:00 server time

**Weekly Quests** (5 per week):
- More challenging objectives
- Reward: Epic gear, large Reputation gains
- Reset Tuesday 04:00 server time

### 6.2 Dynamic Events

| Event | Description | Players | Duration | Rewards |
|---|---|---|---|---|
| Monster Invasion | Waves of monsters attack a city | 10-40 | 15 min | Epic loot, Valor Tokens |
| Escort Mission | Protect an NPC caravan | 5-10 | 10 min | Gold, crafting materials |
| Defense Point | Hold a location against waves | 5-20 | 12 min | Rare gear, Honor Points |
| World Boss Spawn | Powerful boss appears in the world | 20-40 | 20 min | Legendary materials, mounts |
| Resource Surge | Double resource nodes for 30 min | N/A | 30 min | Crafting materials |
| PvP Zone | Special PvP area with objectives | 10-30 | 20 min | PvP gear, Honor Points |

**Event Scaling:** Events scale difficulty based on number of participants.

### 6.3 Dungeon System

**Dungeon Difficulties:**

| Difficulty | Players | iLevel | Mechanics |
|---|---|---|---|
| Normal | 5 | 65-140 | Basic mechanics, forgiving |
| Heroic | 5 | 140-170 | All mechanics active, moderate |
| Mythic | 5 | 170-200 | All mechanics + affixes, punishing |
| Mythic+ | 5 | 170-300 | Scaling difficulty, weekly affixes |

**Mythic+ Affixes (weekly rotation):**
- *Fortified:* Non-boss enemies +20% HP and damage
- *Tyrannical:* Bosses +30% HP and damage
- *Bolstering:* Non-boss enemies buff nearby allies on death
- *Bursting:* Enemies explode on death for 10% max HP AoE
- *Grievous:* Below 90% HP, players take periodic damage
- *Sanguine:* Enemies leave pools of blood on death
- *Volcanic:* Periodic volcanic eruptions under players
- *Quaking:* Periodic AoE interrupt around players

**Dungeon List (5 per region, 30 total):**
*(Each with unique boss mechanics, loot tables, and stories)*

### 6.4 Raid System

**10-Man Raids:**
- 3 wings, 3-4 bosses each
- Normal and Heroic difficulty
- iLevel 200-260

**20-Man Raids:**
- 4 wings, 3-5 bosses each
- Normal, Heroic, and Mythic difficulty
- iLevel 200-300

**Example Boss Mechanics:**

*Boss: The Void Warden (20-man)*
- Phase 1 (100%-70%): Tank swap on Void Strike (stacking debuff), dodge Void Zones, interrupt Shadow Bolt Volley
- Phase 2 (70%-40%): Room shrinks (void walls close in), kill Void Fragments before they reach boss, dodge tentacles
- Phase 3 (40%-0%): All mechanics combined + Enrage timer (8 min), DPS race

### 6.5 Reputation System

**Reputation Tiers:**

| Tier | Points Required | Rewards |
|---|---|---|
| Neutral | 0 | Basic vendor access |
| Friendly | 3000 | Quest unlock, 10% vendor discount |
| Honored | 9000 | Rare recipes, tabard |
| Revered | 21000 | Epic gear, mount |
| Exalted | 42000 | Legendary items, title, unique mount |

---

## 7. PvP SYSTEMS

### 7.1 Open World PvP
- PvP flagging: toggle on/off in capital cities
- Flagged players can attack other flagged players
- Killing a player grants Honor Points
- Dishonor: killing players 10+ levels below = temporary debuff
- PvP zones: certain areas auto-flag everyone

### 7.2 Battlegrounds

| Mode | Players | Objective | Duration |
|---|---|---|---|
| Capture the Crystal | 10v10 | Capture enemy crystal, return to base | 15 min |
| Domination | 15v15 | Hold 3 control points | 20 min |
| Payload | 10v10 | Escort a payload to enemy base | 12 min |

### 7.3 Arena
- 2v2 and 3v3 rated arenas
- MMR-based matchmaking
- Seasons: 3 months each
- Rewards: Titles, mounts, gear at rating thresholds (1000, 1500, 2000, 2500)

### 7.4 PvP Talents
- Separate PvP talent row (3 abilities)
- PvP-specific balance adjustments
- Trinket slot: PvP trinket breaks CC

---

## 8. GUILD SYSTEMS

### 8.1 Guild Creation
- Requires: Level 10, 100 Gold, 5 signatures
- Guild name: 3-24 characters, unique
- Guild tabard: customizable colors and icon

### 8.2 Guild Ranks

| Rank | Permissions |
|---|---|
| Leader | All permissions, disband guild |
| Officer | Invite, kick, promote/demote, manage bank, set MOTD |
| Veteran | Invite, use bank (limited) |
| Member | Use bank (basic), view info |
| Initiate | View info only |

### 8.3 Guild Bank
- 7 tabs (expandable)
- Tab permissions per rank
- Withdrawal limits per day
- Gold storage with logging
- Auto-deposit option

### 8.4 Guild Levels & Perks

| Level | XP Required | Perk |
|---|---|---|
| 1 | 0 | Guild creation |
| 5 | 10,000 | +5% XP in groups |
| 10 | 50,000 | Guild bank tab 2 |
| 15 | 150,000 | +10% reputation gains |
| 20 | 400,000 | Guild bank tab 3 |
| 25 | 800,000 | Mass Resurrection spell |
| 30 | 1,500,000 | Guild mount (Hearthstone Charger) |

### 8.5 Guild vs Guild
- Scheduled siege battles
- Attack/defend guild halls
- Rewards: Territory control, bonus resources, titles

---

## 9. MOUNTS & HOUSING

### 9.1 Mount Types

| Type | Speed | Source |
|---|---|---|
| Ground (Basic) | +60% | Vendor (10g) |
| Ground (Fast) | +100% | Vendor (100g) |
| Ground (Epic) | +200% | Reputation, crafting, drops |
| Flying (Basic) | +150% | Achievement at level 40 |
| Flying (Fast) | +280% | Reputation, raids |
| Flying (Epic) | +310% | Exalted reputation, mythic raids |
| Aquatic | +100% swim | Profession, exploration |

**Mount Abilities:**
- *Charge:* +50% speed for 3s (30s CD)
- *Trot:* Move at walking speed (no dismount)
- *Passenger:* Some mounts carry 1-2 passengers

### 9.2 Housing System

**Personal Housing:**
- Unlocked at level 20 (500g purchase)
- Decorate with furniture (crafted, purchased, or found)
- Furniture effects: Rested XP bonus, storage, trophy displays
- 4 rooms, expandable to 8

**Guild Housing:**
- Unlocked at Guild Level 10 (5000g)
- Shared hall with multiple rooms
- Guild bank access
- War room for GvG planning
- Trophy hall for raid achievements

---

## 10. QUEST DESIGN — Main Storyline

### Act I: Awakening (Levels 1-10)
1. **A New Beginning** — Create your character, learn basic controls
2. **The Village in Peril** — Defend the starter village from wolves
3. **A Mentor's Guidance** — Meet your class trainer
4. **Gathering Supplies** — Collect herbs/ore for the village
5. **Into the Wilds** — First exploration quest
6. **The Corruption** — Discover signs of Void corruption
7. **First Blood** — Enter your first dungeon
8. **The Prophecy** — Learn about the Nexus Crystal
9. **A Friend in Need** — Rescue an NPC ally
10. **The Call to Adventure** — Leave the starter zone

### Act II: The Journey (Levels 10-25)
11-25. Travel through 3 regions, investigating Void incursions
26-30. Discover the Iron Covenant faction
31-35. First major dungeon: The Sunken Citadel
36-40. Uncover the plot of the Void Lords

### Act III: The Conflict (Levels 25-40)
41-50. War between factions threatens the realm
51-60. Join a faction and complete their storyline
61-70. Raids unlock: The Obsidian Sanctum
71-80. Discover the true enemy: the Void Emperor

### Act IV: The Convergence (Levels 40-50)
81-90. Unite the factions against the Void
91-100. Final dungeon: The Nexus Core
101-110. Final raid: The Void Emperor's Throne
111-120. Epilogue: The world is saved, but at what cost?

---

## 11. NPC ECOSYSTEM

### Vendor Types
- **General Vendor:** Basic supplies, food, water, basic gear
- **Specialty Vendor:** Profession materials, recipes, tools
- **Reputation Vendor:** Faction-specific items (requires reputation level)
- **PvP Vendor:** PvP gear (requires Honor/Valor)
- **Token Vendor:** Gear for dungeon/raid tokens

### NPC Behavior
- **Patrol:** NPCs walk predefined paths during day
- **Sleep:** Some NPCs sleep at night (reduced services)
- **Gossip:** NPCs share lore and hints
- **Reactive:** NPCs react to player actions (wave, cheer, cower)
- **Faction-based:** NPC attitude depends on reputation

### Day/Night Cycle
- Game time: 1 real hour = 4 game hours
- Day (6:00-18:00): All vendors active, more patrols
- Night (18:00-6:00): Some vendors close, more hostile spawns, special night events

---

## 12. UI/UX DESIGN

### HUD Layout
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Mini-map]                                      [Quest Tracker]     │
│  ┌───────┐                                        • Quest 1        │
│  │ Map   │                                        • Quest 2        │
│  │       │                                        • Quest 3        │
│  └───────┘                                                          │
│                                                                     │
│                                                                     │
│                        [Game World]                                 │
│                                                                     │
│                                                                     │
│ [Player Frame]                           [Target Frame]             │
│  ██████████ HP                           ██████████ HP              │
│  ████████░░ Mana                         ████████░░ Mana            │
│  [Portrait] [Level]                      [Portrait] [Level]         │
│                                                                     │
│ [Buff Icons]                                                    [Chat]│
│ ┌─────────────────────────────────────────────────────────────┐    │
│ │ [1] [2] [3] [4] [5] [6] [7] [8] [9] [0] [Mount] [Bag]    │    │
│ └─────────────────────────────────────────────────────────────┘    │
│ [HP Bar] [Mana Bar] [XP Bar]                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### Inventory System
- Grid layout: 6 columns × 6 rows (36 slots)
- Bags expand slots (4 bag slots, each adds 8-16 slots)
- Tooltip on hover: item name, rarity, stats, description
- Drag and drop between slots
- Sort button (by type, rarity, level)
- Search/filter bar

### Chat System
- Tabs: General, Combat Log, Whisper, Guild, Party
- Channels: /say (30yd), /yell (300yd), /whisper, /party, /guild, /trade, /general
- Profanity filter (optional)
- Timestamp display
- Chat colors per channel

---

## 13. ACCESSIBILITY

- **Colorblind Modes:** Protanopia, Deuteranopia, Tritanopia (applies to all color-coded elements)
- **Font Scaling:** 75% to 150% in 5% increments
- **Keyboard Navigation:** Full UI navigable via keyboard (Tab, Enter, Escape, Arrow keys)
- **Screen Reader:** ARIA labels on all interactive elements
- **Subtitle System:** All dialogue has subtitles with speaker identification
- **Difficulty Options:** Solo content has Easy/Normal/Hard modes
- **Motion Reduction:** Option to disable screen shake, camera effects
- **High Contrast Mode:** UI elements have enhanced borders and contrast
- **Sound Cues:** Important visual events have audio equivalents
- **Cursor Size:** Adjustable from 50% to 200%

---

## 14. MONETIZATION (Ethical)

### Cosmetic Shop
- Skins: Character outfits (no stat changes)
- Mount Skins: Visual-only mount appearances
- Pets: Companion pets (no combat advantage)
- Housing Items: Decorative furniture
- Emotes: Dance, wave, custom animations
- Price Range: 50-500 Premium Coins ($1-$10)

### Battle Pass
- **Free Track:** 25 tiers — basic cosmetics, gold, consumables
- **Premium Track:** 50 tiers — exclusive skins, mounts, pets, titles
- **Price:** 1000 Premium Coins ($10) per season
- **Duration:** 3 months per season
- **XP Source:** Daily/weekly quests, dungeons, PvP

### Subscription (Optional)
- $15/month
- Benefits: +10% XP, 500 Premium Coins/month, 2 extra bank tabs, exclusive chat color
- **NO** stat advantages, gear, or power boosts

### Rules
- **NEVER** sell power (gear, stats, levels, XP boosts)
- **NEVER** sell convenience that creates pressure (inventory space for free players is sufficient)
- **NEVER** implement loot boxes or gacha mechanics
- All gameplay content available to all players regardless of spending

---

## 15. LIVE SERVICE

### Update Cadence
- **Major Content Updates:** Quarterly (new zones, dungeons, raids, story)
- **Minor Updates:** Monthly (balance, bug fixes, quality of life)
- **Hotfixes:** As needed (critical bugs, exploits)
- **Balance Patches:** Bi-weekly (PvP and PvE tuning)

### Seasonal Events
- **Spring Festival** (March): Flower crowns, egg hunts, spring cosmetics
- **Summer Solstice** (June): Beach party, water mounts, fireworks
- **Harvest Festival** (September): Pumpkin patches, fall cosmetics, cooking contests
- **Winter Veil** (December): Gift giving, snow mounts, holiday dungeon
- **Anniversary** (July): Special events, legacy rewards, developer streams

### Community Feedback
- Public Test Realm (PTR) for major patches
- Monthly developer Q&A streams
- Community forums with developer responses
- Quarterly player surveys
- In-game feedback button
