import * as pg from "pg";
import {
  CreationOptional,
  INTEGER,
  Model,
  Optional,
  STRING,
  Sequelize,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize-cockroachdb";

const dbUrl = process.env.DATABASE_URL || "";

const sequelize = new Sequelize(dbUrl, {
  logging: false,
  dialectModule: pg,
});

const Reclip = sequelize.define<IReclipModel>("reclip", {
  id: {
    type: INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  permalink: {
    type: STRING,
    allowNull: false,
  },
  title: {
    type: STRING,
    allowNull: false,
  },
});

const Picture = sequelize.define<IPictureModel>("picture", {
  id: {
    type: INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  picture: {
    type: STRING,
    allowNull: false,
  },
});

const Video = sequelize.define<IVideoModel>("video", {
  id: {
    type: INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  videoMed: {
    type: STRING,
    allowNull: false,
  },
  videoHigh: {
    type: STRING,
    allowNull: false,
  },
  videoHigher: {
    type: STRING,
    allowNull: false,
  },
});

const Audio = sequelize.define<IAudioModel>("audio", {
  id: {
    type: INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  audioMed: {
    type: STRING,
    allowNull: false,
  },
});

Video.hasMany(Reclip);
Audio.hasMany(Reclip);
Picture.hasMany(Reclip);

Reclip.belongsTo(Video);
Reclip.belongsTo(Audio);
Reclip.belongsTo(Picture);

let sync = false;

async function syncDB() {
  await sequelize
    .sync()
    .then((result) => {
      sync = true;
      console.log("sync = true");
      // console.log(result);
    })
    .catch((err) => console.log(err));
}

export async function getReclipsDB(
  offset: number,
  limit: number
): Promise<IReclip[] | null> {
  // await syncDB();
  const reclips = await Reclip.findAll({
    include: [Video, Audio, Picture],
    limit,
    offset,
    order: [["id", "DESC"]],
  });
  if (reclips) {
    return reclips.map((reclip) => reclip.toJSON<IReclip>());
  } else {
    return null;
  }
}

export async function hasPermalink(permalink: string) {
  if (sync === false) {
    await syncDB();
  }
  const count = await Reclip.count({ where: { permalink } });
  return count !== 0;
}

export async function createReclip(reclip: ICreateReclip) {
  const {
    permalink,
    videoMed,
    videoHigh,
    videoHigher,
    audioMed,
    title,
    picture,
  } = reclip;

  if (sync === false) {
    await syncDB();
  }

  if (permalink === null) {
    throw new Error("permalink is empty!");
  }

  const audioObj = audioMed ? await Audio.create({ audioMed }) : null;
  const videoObj =
    videoMed || videoHigh || videoHigher
      ? await Video.create({
          videoMed,
          videoHigh,
          videoHigher,
        })
      : null;
  const pictureObj = picture ? await Picture.create({ picture }) : null;

  const reclipDB: IReclipDB = {
    permalink,
    title,
    videoId: null,
    audioId: null,
    pictureId: null,
  };

  if (videoObj?.id) {
    reclipDB.videoId = videoObj.id;
  }
  if (audioObj?.id) {
    reclipDB.audioId = audioObj.id;
  }
  if (pictureObj?.id) {
    reclipDB.pictureId = pictureObj.id;
  }

  return await Reclip.create(reclipDB);
}

export interface ICreateReclip {
  permalink: string | null;
  videoMed: string | null;
  videoHigh: string | null;
  videoHigher: string | null;
  audioMed: string | null;
  title: string | null;
  picture: string | null;
}

interface IReclipDB extends Optional<any, string> {
  permalink: string | null;
  title: string | null;
  videoId: number | null;
  audioId: number | null;
  pictureId: number | null;
}

interface IReclip extends Model<any, any> {
  id: number;
  permalink: string;
  title: string;
  videoId: string | null;
  audioId: string | null;
  pictureId: string | null;
  video?: {
    id: string;
    videoMed: string | null;
    videoHigh: string | null;
    videoHigher: string | null;
  };
  audio?: {
    id: string;
    audioMed: string;
  };
  picture?: {
    id: string;
    picture: string;
  };
}

interface IVideoModel
  extends Model<
    InferAttributes<IVideoModel>,
    InferCreationAttributes<IVideoModel>
  > {
  id: CreationOptional<number>;
  videoMed: string | null;
  videoHigh: string | null;
  videoHigher: string | null;
}

interface IAudioModel
  extends Model<
    InferAttributes<IAudioModel>,
    InferCreationAttributes<IAudioModel>
  > {
  id: CreationOptional<number>;
  audioMed: string | null;
}

interface IPictureModel
  extends Model<
    InferAttributes<IPictureModel>,
    InferCreationAttributes<IPictureModel>
  > {
  id: CreationOptional<number>;
  picture: string | null;
}

interface IReclipModel
  extends Model<
    InferAttributes<IReclipModel>,
    InferCreationAttributes<IReclipModel>
  > {
  id: CreationOptional<number>;
  title: string | null;
  permalink: string | null;
}
