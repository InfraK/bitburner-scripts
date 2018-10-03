export async function main(ns) {
  const scripts = [{
      name: 'bladeburner',
      type: 'ns'
    },
    {
      name: 'stockTrade-noShort',
      type: 'ns'
    },
    {
      name: 'hackLoop',
      type: 'ns'
    },
    {
      name: 'buyPrograms',
      type: 'ns'
    },
    {
      name: 'liquidatePositions',
      type: 'ns'
    },
    {
      name: 'startCrime',
      type: 'ns'
    },
    {
      name: 'singularity',
      type: 'ns'
    },
    {
      name: 'targetServer',
      type: 'ns'
    },
    {
      name: 'manager',
      type: 'ns'
    },
    {
      name: 'hack',
      type: 'script'
    },
    {
      name: 'weaken',
      type: 'script'
    },
    {
      name: 'grow',
      type: 'script'
    },
    {
      name: 'distribute',
      type: 'ns'
    },
    {
      name: 'stockTrade',
      type: 'ns'
    },
    {
      name: 'startStock',
      type: 'script'
    },
    {
      name: 'sma',
      type: 'ns'
    },
    {
      name: 'root',
      type: 'ns'
    }
  ];

  for (let s of scripts) {
    await ns.wget(
      `https://raw.githubusercontent.com/InfraK/bitburner-scripts/master/${s.name}.js`,
      `${s.name}.${s.type}`
    );
  }
}