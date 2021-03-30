pipi-schedule
==================
Googleカレンダーの予定をLINEに通知するアプリ

デプロイ方法
-----------
1. `cp env.example.yaml env.yaml`して必要な事項を記載
2. Cloud Storageでバケットを作成する
3. `src/index.ts`からexportした関数をnpm scriptに渡して実行する
   ```tsx
   npm run release -- auth
   npm run release -- callback
   npm run release -- pipiSchedule
   ```

実行手順
----------
1. 認証する `gcloud functions call auth`
2. `gcloud functions call pipiSchedule`

スケジューリング
----------
Cloud SchedulerでCronjobを作成する
https://cloud.google.com/scheduler/docs/http-target-auth?hl=ja
