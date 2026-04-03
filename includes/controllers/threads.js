module.exports = function ({ models, api }) {
	const Threads = models.use('Threads');

	async function getInfo(threadID) {
		return await api.getThreadInfo(threadID);
	}

	async function getAll(...data) {
		let where, attributes;
		for (const i of data) {
			if (Array.isArray(i)) attributes = i;
			else if (typeof i === "object") where = i;
		}
		return (await Threads.findAll({ where, attributes }))
			.map(e => e.get({ plain: true }));
	}

	async function getData(threadID) {
		const data = await Threads.findOne({ where: { threadID } });
		return data ? data.get({ plain: true }) : false;
	}

	async function setData(threadID, options = {}) {
		let data = await Threads.findOne({ where: { threadID } });

		if (!data) {
			await createData(threadID, options);
			return true;
		}

		await data.update(options);
		return true;
	}

	async function delData(threadID) {
		const data = await Threads.findOne({ where: { threadID } });
		if (!data) return false;
		await data.destroy();
		return true;
	}

	async function createData(threadID, defaults = {}) {
		await Threads.findOrCreate({
			where: { threadID },
			defaults
		});
		return true;
	}

	return {
		getInfo,
		getAll,
		getData,
		setData,
		delData,
		createData
	};
};
