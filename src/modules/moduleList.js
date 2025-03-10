import MODULES from "@/data/specs.json";

class ModuleList {
  constructor() {
    this.modules = Object.values(MODULES).sort((a, b) => {
      const pitchDiff = a.pitch - b.pitch;
      if (pitchDiff !== 0) return pitchDiff;

      return a.id.localeCompare(b.id);

    }).map(moduleData => {
      const moduleLabel = [[
        moduleData.environment,
        `P${moduleData.pitch}mm`,
        moduleData.material,
        moduleData.product.join('-'),
      ].filter(s => s !== '').join(" "), /*moduleData.id*/].join(' | ');

      return {label: moduleLabel, ...moduleData};
    });
  }

  find(id) {
    const match = this.modules.find(entry => entry.id === id);
    return match ? match : false;
  }

  generateLabels() {
    return this.modules.reduce((list, item) => {

      if (item.environment === "OUT") list.Outdoor.push(item);
      else if (item.environment === "IN") list.Indoor.push(item);
      else console.warn("Avertissement, le module n'est ni IN ni OUT:", item);

      return list;
    }, { Outdoor: [], Indoor: [] });
  }
}

export const Modules = new ModuleList();
export const ModulesLabels = Modules.generateLabels();