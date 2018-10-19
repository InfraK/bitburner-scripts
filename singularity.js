async function studyHacking(ns, limit) {
  ns.travelToCity("Volhaven");
  while (ns.getStats().hacking < limit) {
    ns.universityCourse("ZB Institute of Technology", "Algorithms");
    await ns.sleep(10000);
  }
}

async function gymRoutine(ns, limit, study) {
  if (study) {
    ns.travelToCity("Sector-12");
  }
  while (ns.getStats().strength < limit) {
    ns.gymWorkout("Powerhouse Gym", "str");
    await ns.sleep(10000);
  }
  while (ns.getStats().defense < limit) {
    ns.gymWorkout("Powerhouse Gym", "def");
    await ns.sleep(10000);
  }
  while (ns.getStats().dexterity < limit) {
    ns.gymWorkout("Powerhouse Gym", "dex");
    await ns.sleep(10000);
  }
  while (ns.getStats().agility < limit) {
    ns.gymWorkout("Powerhouse Gym", "agi");
    await ns.sleep(10000);
  }
}

export async function main(ns) {
  const limit = ns.args[0];
  const crime = ns.args[1];
  const study = ns.args[2];
  if (study ) {
    await studyHacking(ns, limit);
  }
  await gymRoutine(ns, limit, study);
  if(crime) {
    await ns.run("startCrime.ns");
  }
}