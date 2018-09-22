
async function studyHacking(ns) {
  ns.travelToCity('Volhaven');
  while (ns.getStats().hacking < 50) {
    ns.universityCourse('ZB Institute of Technology', 'Algorithms');
    await ns.sleep(10000);
  }
}

async function gymRoutine(ns) {
  ns.travelToCity('Sector-12');
  while (ns.getStats().strength < 300) {
    ns.gymWorkout('Powerhouse Gym', 'str');
    await ns.sleep(10000);
  }
  while (get_stats().defense < 300) {
    ns.gymWorkout('Powerhouse Gym', 'def');
    await ns.sleep(10000);
  }
  while (get_stats().dexterity < 300) {
    ns.gymWorkout('Powerhouse Gym', 'dex');
    await ns.sleep(10000);
  }
  while (get_stats().agility < 300) {
    ns.gymWorkout('Powerhouse Gym', 'agi');
    await ns.sleep(10000);
  }
}

export async function main(ns) {
  studyHacking(ns);
  gymRoutine(ns);
  await run('startCrime.ns');
}