・入庫実績
---ICC
SELECT TRIM(SHN_HISCD), SUM(KONPO_LEN)
FROM ENSTDNYULG
WHERE SHN_CD = :shn_cd
AND NK_KBN = :nk_kbn
AND NK_YMD >= TO_DATE(:nk_ymd_from, 'yyyy/mm/dd')
AND NK_YMD < TO_DATE(:nk_ymd_to, 'yyyy/mm/dd')
GROUP BY SHN_HISCD ORDER BY SHN_HISCD

---TSA, LAP
SELECT TRIM(SHN_HISCD || KONPO_SHABA) || 'mm' HIS_HABA, SUM(KONPO_LEN)
FROM ENSTDNYULG
WHERE SHN_CD = :shn_cd
AND NK_KBN = :nk_kbn
AND NK_YMD >= TO_DATE(:nk_ymd_from, 'yyyy/mm/dd')
AND NK_YMD < TO_DATE(:nk_ymd_to, 'yyyy/mm/dd')
GROUP BY SHN_HISCD, KONPO_SHABA ORDER BY HIS_HABA

・在庫
---ICC
SELECT TRIM(S.SHN_HISCD), SUM(S.SHIK_LEN)
FROM ENSTDSIKAZ S
LEFT JOIN ENSTMKOTEI K ON S.PRO_CD = K.PRO_CD
WHERE S.SHN_CD = :shn_cd
AND S.PRO_CD IN (...:pro_cd)
GROUP BY SHN_HISCD ORDER BY s.SHN_HISCD

---TSA, LPA
SELECT TRIM(S.SHN_HISCD || SHIK_SHABA) || 'mm' HIS_HABA, SUM(S.SHIK_LEN)
FROM ENSTDSIKAZ S
LEFT JOIN ENSTMKOTEI K ON S.PRO_CD = K.PRO_CD
WHERE S.SHN_CD = :shn_cd
AND S.PRO_CD IN (...:pro_cd)
GROUP BY SHN_HISCD,SHIK_SHABA ORDER BY s.SHN_HISCD

・計画
---ICC
SELECT TRIM(SHN_HISCD), NK_YM, SUM(NK_LEN)
FROM ENSTDNYUPL
WHERE SHN_CD = :shn_cd
AND NK_YM >= :nk_ym_from
AND NK_YM <= :nk_ym_to
GROUP BY SHN_HISCD, NK_YM ORDER BY SHN_HISCD, NK_YM

---TSA, LPA

SELECT TRIM(SHN_HISCD || SHN_HABA) HIS_HABA, NK_YM, SUM(NK_LEN)
WHERE SHN_CD = :shn_cd
AND NK_YM >= :nk_ym_from
AND NK_YM <= :nk_ym_to
GROUP BY SHN_HISCD, SHN_HABA, NK_YM ORDER BY HIS_HABA, NK_YM