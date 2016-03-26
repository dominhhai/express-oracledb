・目標値
SELECT SHN_CD, SYURIT_VAL1, SYURIT_VAL2
FROM ENSTMSEIHN
WHERE SHN_CD = :shn_cd

・収率
SELECT TO_CHAR(jz_ymd, 'yyyy/mm/dd')
, ROUND(SUM(s_ryo) / SUM(tny_ryo),2) * 100 syuritu
FROM enstdsgnpo sgn
LEFT JOIN enstmshins his ON sgn.S_HISCD = his.SHN_HISCD
WHERE shn_cd = :shn_cd
AND pro_cd IN (...:pro_cd)
AND JZ_YMD >= TO_DATE(:jz_ymd_from, 'yyyy/mm/dd')
AND JZ_YMD <= TO_DATE(:jz_ymd_to, 'yyyy/mm/dd')
GROUP BY jz_ymd ORDER BY jz_ymd
