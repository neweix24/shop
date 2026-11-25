# Import the storefront ZIP from GitHub mobile

This repository has a guarded GitHub Actions workflow for importing the supplied source archive without overwriting existing repository files.

## One required upload step

1. Open the repository branch `feat/neweix-storefront-integration` on GitHub: https://github.com/neweix24/shop/tree/feat/neweix-storefront-integration
2. Use **Add file → Upload files**.
3. Select the original `code.zip` from the phone and upload it to the repository root with the exact name `code.zip`.
4. Commit only that archive upload to `feat/neweix-storefront-integration`. Do not upload any extracted files or secrets.

## Run the importer

1. Open the repository's **Actions** tab.
2. Select **Import uploaded storefront archive**.
3. Choose **Run workflow**.
4. Keep the branch as `feat/neweix-storefront-integration`, archive path as `code.zip`, and destination as `.`.
5. Run the workflow.

The workflow:
- validates ZIP paths to prevent path traversal;
- excludes nested source archives, the Manus debug collector, and the Vite backup;
- preserves `.env.example` but excludes real `.env` files;
- refuses to overwrite any existing repository file;
- removes the uploaded ZIP after a successful extraction;
- commits the extracted source to the selected integration branch.

If it reports a path conflict, stop and review the conflict list rather than forcing an overwrite.

## What happens after import

The source can then be reviewed and adapted in the repository. The import workflow does not claim the app is production-ready and does not deploy to Cloudflare. Worker migration, approved database persistence, Account/Eixon/Pathao contracts, provider credentials, tests, and staging release gates remain separate tasks.
