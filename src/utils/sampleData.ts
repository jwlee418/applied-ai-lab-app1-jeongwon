export const SAMPLE_CSV_CONTENT = `quarter,region,channel,product,units,discount_pct,revenue
Q1,North America,Direct Enterprise,Enterprise Cloud Suite,120,0.10,360000
Q1,North America,Online Store,Developer Pro Tools,450,0.05,135000
Q1,North America,Partner Reseller,AI Analytics Engine,80,0.15,240000
Q1,North America,Inside Sales,Premier Support,95,0.00,95000
Q1,Europe,Direct Enterprise,Enterprise Cloud Suite,90,0.12,270000
Q1,Europe,Online Store,Developer Pro Tools,310,0.05,93000
Q1,Europe,Partner Reseller,Security Gateway,140,0.10,140000
Q1,Europe,Inside Sales,Premier Support,60,0.00,60000
Q1,Asia Pacific,Online Store,Developer Pro Tools,520,0.08,156000
Q1,Asia Pacific,Partner Reseller,Hardware Appliance,75,0.15,225000
Q1,Asia Pacific,Direct Enterprise,Enterprise Cloud Suite,65,0.10,195000
Q1,Latin America,Partner Reseller,Security Gateway,90,0.15,90000
Q1,Latin America,Online Store,Developer Pro Tools,180,0.05,54000
Q1,Middle East,Direct Enterprise,Enterprise Cloud Suite,40,0.10,120000
Q1,Middle East,Partner Reseller,Hardware Appliance,35,0.12,105000
Q2,North America,Direct Enterprise,Enterprise Cloud Suite,145,0.10,435000
Q2,North America,Online Store,Developer Pro Tools,480,0.05,144000
Q2,North America,Partner Reseller,AI Analytics Engine,95,0.12,285000
Q2,North America,Inside Sales,Premier Support,110,0.00,110000
Q2,Europe,Direct Enterprise,Enterprise Cloud Suite,105,0.15,315000
Q2,Europe,Online Store,Developer Pro Tools,340,0.05,102000
Q2,Europe,Partner Reseller,Security Gateway,160,0.12,160000
Q2,Europe,Inside Sales,Premier Support,70,0.00,70000
Q2,Europe,Partner Reseller,AI Analytics Engine,40,0.18,120000
Q2,Asia Pacific,Online Store,Developer Pro Tools,580,0.08,174000
Q2,Asia Pacific,Partner Reseller,Hardware Appliance,85,0.15,255000
Q2,Asia Pacific,Direct Enterprise,Enterprise Cloud Suite,80,0.10,240000
Q2,Asia Pacific,Partner Reseller,AI Analytics Engine,60,0.12,180000
Q2,Latin America,Partner Reseller,Security Gateway,110,0.15,110000
Q2,Latin America,Online Store,Developer Pro Tools,210,0.05,63000
Q2,Middle East,Direct Enterprise,Enterprise Cloud Suite,45,0.10,135000
Q2,Middle East,Partner Reseller,Hardware Appliance,40,0.12,120000
Q3,North America,Direct Enterprise,Enterprise Cloud Suite,160,0.10,480000
Q3,North America,Online Store,Developer Pro Tools,510,0.05,153000
Q3,North America,Partner Reseller,AI Analytics Engine,115,0.10,345000
Q3,North America,Inside Sales,Premier Support,125,0.00,125000
Q3,Europe,Direct Enterprise,Enterprise Cloud Suite,230,0.08,690000
Q3,Europe,Direct Enterprise,AI Analytics Engine,180,0.05,540000
Q3,Europe,Online Store,Developer Pro Tools,420,0.05,126000
Q3,Europe,Partner Reseller,Security Gateway,210,0.08,210000
Q3,Europe,Inside Sales,Premier Support,115,0.00,115000
Q3,Asia Pacific,Online Store,Developer Pro Tools,610,0.08,183000
Q3,Asia Pacific,Partner Reseller,Hardware Appliance,90,0.15,270000
Q3,Asia Pacific,Direct Enterprise,Enterprise Cloud Suite,95,0.10,285000
Q3,Asia Pacific,Partner Reseller,AI Analytics Engine,75,0.10,225000
Q3,Latin America,Partner Reseller,Security Gateway,120,0.15,120000
Q3,Latin America,Online Store,Developer Pro Tools,230,0.05,690000
Q3,Middle East,Direct Enterprise,Enterprise Cloud Suite,50,0.10,150000
Q3,Middle East,Partner Reseller,Hardware Appliance,45,0.12,135000
Q4,North America,Direct Enterprise,Enterprise Cloud Suite,185,0.10,555000
Q4,North America,Online Store,Developer Pro Tools,590,0.05,177000
Q4,North America,Partner Reseller,AI Analytics Engine,140,0.10,420000
Q4,North America,Inside Sales,Premier Support,140,0.00,140000
Q4,Europe,Direct Enterprise,Enterprise Cloud Suite,250,0.08,750000
Q4,Europe,Direct Enterprise,AI Analytics Engine,205,0.05,615000
Q4,Europe,Online Store,Developer Pro Tools,460,0.05,138000
Q4,Europe,Partner Reseller,Security Gateway,230,0.08,230000
Q4,Europe,Inside Sales,Premier Support,130,0.00,130000
Q4,Asia Pacific,Online Store,Developer Pro Tools,680,0.08,204000
Q4,Asia Pacific,Partner Reseller,Hardware Appliance,105,0.15,315000
Q4,Asia Pacific,Direct Enterprise,Enterprise Cloud Suite,110,0.10,330000
Q4,Asia Pacific,Partner Reseller,AI Analytics Engine,90,0.10,270000
Q4,Latin America,Partner Reseller,Security Gateway,135,0.15,135000
Q4,Latin America,Online Store,Developer Pro Tools,250,0.05,75000
Q4,Middle East,Direct Enterprise,Enterprise Cloud Suite,60,0.10,180000
Q4,Middle East,Partner Reseller,Hardware Appliance,50,0.12,150000`;

// Sample specifically featuring human error in text columns (West vs west, spaces, casing, etc.)
export const SAMPLE_DIRTY_CSV_CONTENT = `quarter,region,channel,product,units,discount_pct,revenue
Q1,West,direct enterprise,enterprise cloud suite,80,0.10,240000
Q1,west,online store,Developer Pro Tools,190,0.05,57000
Q1,East,Partner Reseller,Security Gateway,110,0.12,110000
Q1,Central,Direct Enterprise,Enterprise Cloud Suite,70,0.10,210000
q2,West,Direct Enterprise,Enterprise Cloud Suite,95,0.10,285000
Q2,west,Online Store,Developer Pro Tools,220,0.05,66000
Q2, WEST ,Partner Reseller,ai analytics engine,45,0.15,135000
Q2,East,Direct Enterprise,Enterprise Cloud Suite,85,0.12,255000
Q2,East,Partner Reseller,Security Gateway,130,0.10,130000
Q2,Central,Direct Enterprise,Enterprise Cloud Suite,75,0.10,225000
Q3,West,Direct Enterprise,Enterprise Cloud Suite,190,0.08,570000
q3,west,Direct Enterprise,AI Analytics Engine,140,0.05,420000
Q3,  West  ,Online Store,Developer Pro Tools,290,0.05,87000
Q3,west,Partner Reseller,Security Gateway,160,0.08,160000
Q3,East,Direct Enterprise,Enterprise Cloud Suite,90,0.12,270000
Q3,East,Partner Reseller,Security Gateway,140,0.10,140000
Q3,Central,Direct Enterprise,Enterprise Cloud Suite,80,0.10,240000
Q4,West,Direct Enterprise,Enterprise Cloud Suite,210,0.08,630000
Q4,west,Direct Enterprise,AI Analytics Engine,160,0.05,480000
Q4,East,Direct Enterprise,Enterprise Cloud Suite,95,0.12,285000
Q4,Central,Direct Enterprise,Enterprise Cloud Suite,85,0.10,255000`;
