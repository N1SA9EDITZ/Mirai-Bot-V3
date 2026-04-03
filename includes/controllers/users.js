module.exports = function ({ models, api }) {
	const Users = models.use('Users');

	async function getInfo(id) {
		return (await api.getUserInfo(id))[id];
	}

	async function getNameUser(id) {
		try {
			if (global.data.userName.has(id)) return global.data.userName.get(id);

			const data = await getData(id);
			if (data && data.name) return data.name;

			return "Facebook User";
		} catch {
			return "Facebook User";
		}
	}

	async function getAll(...data) {
		let where, attributes;
		for (const i of data) {
			if (Array.isArray(i)) attributes = i;
			else if (typeof i === "object") where = i;
		}
		return (await Users.findAll({ where, attributes }))
			.map(e => e.get({ plain: true }));
	}

	async function getData(userID) {
		const data = await Users.findOne({ where: { userID } });
		return data ? data.get({ plain: true }) : false;
	}

	async function setData(userID, options = {}) {
		let data = await Users.findOne({ where: { userID } });

		if (!data) {
			await createData(userID, options);
			return true;
		}

		await data.update(options);
		return true;
	}

	async function delData(userID) {
		const data = await Users.findOne({ where: { userID } });
		if (!data) return false;
		await data.destroy();
		return true;
	}

	async function createData(userID, defaults = {}) {
		await Users.findOrCreate({
			where: { userID },
			defaults
		});
		return true;
	}

	return {
		getInfo,
		getNameUser,
		getAll,
		getData,
		setData,
		delData,
		createData
	};
};
