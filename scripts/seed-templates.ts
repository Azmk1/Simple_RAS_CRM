import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Clearing old Goal Templates...');
  await prisma.goalTemplate.deleteMany({});
  
  console.log('Seeding Fillable Goal Templates...');
  
  // 1. Skill Goals
  const skills = [
    { domain: 'Communication', description: 'Client will independently mand for [___] missing items needed to complete a task across [___] consecutive sessions.', mastery: '[___]% across [___] consecutive sessions' },
    { domain: 'Play/Leisure', description: 'Client will engage in independent functional play with a toy for [___] consecutive minutes without prompting.', mastery: '[___] mins across [___] sessions' },
    { domain: 'Social', description: 'Client will initiate a greeting with a peer by waving or saying "hi" within [___] seconds of the peer approaching.', mastery: '[___]% of opportunities across [___] sessions' },
    { domain: 'Adaptive', description: 'Client will independently complete all steps of [___] according to the task analysis.', mastery: '100% across [___] consecutive sessions' },
    { domain: 'Communication', description: 'Client will tact [___] distinct items or pictures in their natural environment.', mastery: '[___]% accuracy across [___] sessions' },
    { domain: 'Social', description: 'Client will take turns during a [___]-minute game with a peer with no more than [___] prompt(s).', mastery: '[___]% of opportunities' },
    { domain: 'Adaptive', description: 'Client will tolerate sitting in a [___] for [___] minutes without challenging behavior.', mastery: '[___] minutes across [___] visits' },
    { domain: 'Communication', description: 'Client will use an AAC device to request [___] preferred items independently.', mastery: '[___]% of opportunities across [___] days' },
    { domain: 'Play/Leisure', description: 'Client will engage in cooperative play with a peer, sharing materials for [___] minutes.', mastery: '[___] minutes across [___] sessions' },
    { domain: 'Adaptive', description: 'Client will independently follow a [___]-step visual schedule to transition between activities.', mastery: '[___]% of transitions across [___] sessions' },
    { domain: 'Social', description: 'Client will answer "Wh-" questions regarding a short story with [___]% accuracy.', mastery: '[___]% across [___] probes' },
    { domain: 'Play/Leisure', description: 'Client will independently transition away from a preferred electronic device when a timer goes off.', mastery: '[___]% of transitions across [___] sessions' },
  ];

  for (const s of skills) {
    await prisma.goalTemplate.create({
      data: { type: 'SKILL', ...s, authorName: 'Global ABA Standards' }
    });
  }

  // 2. Behavior Reduction
  const brps = [
    { behavior: 'Elopement', topography: 'Any instance of client moving more than [___] feet away from the therapist without permission.', function: 'Escape', antecedent: 'Provide frequent breaks, use visual schedules to signal transitions.', consequence: 'Block access to exit, redirect back to designated area, neutral tone.' },
    { behavior: 'Physical Aggression', topography: 'Hitting, kicking, or biting others with enough force to [___].', function: 'Access to Tangible', antecedent: 'Use First/Then language, provide a transition timer.', consequence: 'Block the strike, remove the tangible item, minimal eye contact.' },
    { behavior: 'Property Destruction', topography: 'Throwing, breaking, or tearing items that do not belong to them.', function: 'Attention', antecedent: 'Provide non-contingent high-quality attention every [___] minutes.', consequence: 'Ignore the behavior (planned ignoring), block if dangerous, prompt functional communication.' },
    { behavior: 'Vocal Stereotypy', topography: 'Non-contextual vocalizations, humming, or repeating scripts (echolalia) at a volume above conversational level.', function: 'Sensory', antecedent: 'Enrich the environment with preferred sensory items (e.g., music).', consequence: 'Do not interrupt if safe, provide differential reinforcement for appropriate functional communication.' },
    { behavior: 'Non-Compliance', topography: 'Failing to initiate a task within [___] seconds of a clear instruction.', function: 'Escape', antecedent: 'Deliver instruction close to client, ensure eye contact, use simple language.', consequence: 'Implement 3-step prompting (vocal, model, physical) until compliance is achieved.' },
    { behavior: 'Self-Injurious Behavior (SIB)', topography: 'Head-banging or biting self with enough force to cause redness or injury.', function: 'Sensory', antecedent: 'Ensure environment is padded, provide chew tubes or deep pressure therapy.', consequence: 'Block impact safely, provide neutral redirection, minimize vocal feedback.' },
  ];

  for (const b of brps) {
    await prisma.goalTemplate.create({
      data: { type: 'BRP', ...b, authorName: 'Global ABA Standards' }
    });
  }

  // 3. Parent Training
  const parents = [
    { description: 'Caregiver will demonstrate correct implementation of the [___]-step prompting procedure with [___]% accuracy.', mastery: '[___]% across [___] consecutive sessions' },
    { description: 'Caregiver will successfully collect ABC data for [___] instances of target behaviors.', mastery: '[___] complete data sheets' },
    { description: 'Caregiver will implement the [___] visual schedule during morning routine.', mastery: '[___]% of steps correct across [___] days' },
    { description: 'Caregiver will demonstrate the use of Differential Reinforcement of Alternative behavior (DRA) when the client mands appropriately.', mastery: '[___]% accuracy across [___] observations' },
    { description: 'Caregiver will successfully implement the extinction protocol for [___] behavior without yielding to extinction bursts.', mastery: '[___]% fidelity across [___] sessions' },
    { description: 'Caregiver will facilitate a [___]-minute independent play session using [___] strategies.', mastery: '[___] consecutive successful sessions' },
  ];

  for (const p of parents) {
    await prisma.goalTemplate.create({
      data: { type: 'PARENT', ...p, authorName: 'Global ABA Standards' }
    });
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
