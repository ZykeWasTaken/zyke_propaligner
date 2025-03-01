local createQuery = [[
	CREATE TABLE IF NOT EXISTS `zyke_propaligner_presets` (
		`id` VARCHAR(20) PRIMARY KEY,
		`label` TINYTEXT NOT NULL,
		`data` MEDIUMTEXT NOT NULL,
		`last_used` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
	);
]]

MySQL.query.await(createQuery)