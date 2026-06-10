import { BundleService } from '../src/services/bundle.service';
import { prisma } from '../src/lib/prisma';
import { BundleStatus, ApplicationStatus } from '@prisma/client';

async function test() {
  console.log('--- DB test start ---');
  try {
    // 1. Find a draft bundle
    const draftBundle = await prisma.bundle.findFirst({
      where: { status: BundleStatus.DRAFT_BUNDLE },
    });
    console.log('Draft bundle found:', draftBundle);

    if (draftBundle) {
      // Find items in this bundle
      const items = await prisma.permohonan.findMany({
        where: { bundleId: draftBundle.id },
      });
      console.log('Items in bundle:', items.map(i => ({ id: i.id, nomorBerkas: i.nomorBerkas, bundleId: i.bundleId })));

      if (items.length > 0) {
        const itemToRemove = items[0];
        console.log(`Testing remove item ${itemToRemove.nomorBerkas} from bundle ${draftBundle.bundleNumber}...`);
        const removeResult = await BundleService.removeItemFromBundle(draftBundle.id, itemToRemove.id, {
          id: 'system-test',
          name: 'System Test',
          role: 'STAF_PENELITI',
        });
        console.log('Remove item result:', removeResult);

        // Put it back to bundle for other tests
        console.log(`Testing add item back...`);
        const addResult = await BundleService.addItemToBundle(draftBundle.id, itemToRemove.id, {
          id: 'system-test',
          name: 'System Test',
          role: 'STAF_PENELITI',
        });
        console.log('Add item back result:', addResult);
      }

      console.log(`Testing finalize bundle ${draftBundle.bundleNumber}...`);
      const finalizeResult = await BundleService.finalizeBundle(draftBundle.id, {
        id: 'system-test',
        name: 'System Test',
        role: 'STAF_PENELITI',
      });
      console.log('Finalize result:', finalizeResult);
      
      if (finalizeResult.success) {
        console.log(`Testing re-examine bundle ${draftBundle.bundleNumber}...`);
        const reexamineResult = await BundleService.reExamineBundle(draftBundle.id, {
          id: 'system-test',
          name: 'System Test',
          role: 'STAF_PENELITI',
        });
        console.log('Re-examine result:', reexamineResult);
      }
    } else {
      console.log('No draft bundle found to test.');
    }
  } catch (error) {
    console.error('Error in test:', error);
  } finally {
    await prisma.$disconnect();
    console.log('--- DB test end ---');
  }
}

test();
