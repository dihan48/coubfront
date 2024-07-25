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
  JSONB,
  DataTypes,
  CreationAttributes,
  Attributes,
  UniqueConstraintError,
} from "sequelize-cockroachdb";

const dbUrl = process.env.DATABASE_URL || "";

const sequelize = new Sequelize(dbUrl, {
  logging: false,
  dialectModule: pg,
});

export const Reclip = sequelize.define<IReclipModel>("reclip", {
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
  videoMedLink: {
    type: JSONB,
    allowNull: true,
  },
  videoHighLink: {
    type: JSONB,
    allowNull: true,
  },
  videoHigherLink: {
    type: JSONB,
    allowNull: true,
  },
  audioLink: {
    type: JSONB,
    allowNull: true,
  },
  pictureLink: {
    type: JSONB,
    allowNull: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

export const Users = sequelize.define<IUsersModel>("users", {
  id: {
    type: INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false,
  },
  login: {
    type: STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

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
): Promise<Attributes<IReclipModel>[] | null> {
  // await syncDB();
  const reclips = await Reclip.findAll({
    limit,
    offset,
    order: [["id", "DESC"]],
  });
  if (reclips) {
    return reclips.map((reclip) => reclip.toJSON<Attributes<IReclipModel>>());
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

export async function registerUser(login: string, password: string) {
  if (sync === false) {
    await syncDB();
  }

  try {
    return await Users.create({ login, password });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      throw new Error("UniqueConstraintError");
    }
  }
}

export async function getUser(login: string) {
  if (sync === false) {
    await syncDB();
  }
  const user = await Users.findOne({ where: { login } });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
}

export async function createReclip(reclip: CreationAttributes<IReclipModel>) {
  if (sync === false) {
    await syncDB();
  }

  return await Reclip.create(reclip);
}

export interface IAttributesReclipModel extends Attributes<IReclipModel> {}

export interface IReclipModel
  extends Model<
    InferAttributes<IReclipModel>,
    InferCreationAttributes<IReclipModel>
  > {
  id: CreationOptional<number>;
  title: string;
  permalink: string;
  videoMedLink: string | null;
  videoHighLink: string | null;
  videoHigherLink: string | null;
  audioLink: string | null;
  pictureLink: string | null;
  createdAt: CreationOptional<Date>;
}

interface IUsersModel
  extends Model<
    InferAttributes<IUsersModel>,
    InferCreationAttributes<IUsersModel>
  > {
  id: CreationOptional<number>;
  login: string;
  password: string;
  createdAt: CreationOptional<Date>;
}
