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
  Op,
  QueryTypes,
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

export const User = sequelize.define<IUsersModel>("user", {
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

export const View = sequelize.define<IViewsModel>("view", {
  reclipId: {
    type: INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  count: {
    type: INTEGER,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});

View.sync(); // sync the model with the data source

Reclip.hasMany(View);
View.belongsTo(Reclip);

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
  limit: number,
  userId?: string,
  date?: number
): Promise<IReclipsDB[] | null> {
  if (sync === false) {
    await syncDB();
  }

  if (userId) {
    const dateStamp = date
      ? new Date(date).toISOString()
      : new Date().toISOString();

    const reclips: IReclipsDB[] = await sequelize.query(
      {
        query: `
          select
            SUM(views.count) as count,
            reclips.*
          from
            (
            select
              reclips.*
            from
              reclips
            left join views on
                views."createdAt" < ?
                and reclips.id = views."reclipId"
                and views."userId" = ?
            where
              views."reclipId" is null
            group by
              reclips.id
            order by
              id desc
            limit ?
            offset ?
          ) as reclips
          left join views on
            reclips.id = views."reclipId"
          group by
            reclips.id
          order by
            id desc
          limit ?;
        `,
        values: [
          dateStamp,
          userId,
          limit,
          offset,
          limit,
        ],
      },
      {
        type: QueryTypes.SELECT,
      }
    );

    if (reclips) {
      return reclips;
    } else {
      return null;
    }
  } else {
    const reclips: IReclipsDB[] = await sequelize.query(
      {
        query: `
          SELECT
            SUM(views.count) as count, reclips.*
          FROM (
            SELECT reclips.*
            FROM reclips  
            ORDER BY id DESC 
            LIMIT ? OFFSET ?
          ) as reclips
          LEFT JOIN views 
          ON reclips.id = views."reclipId"
          GROUP BY reclips.id
          ORDER BY reclips.id DESC
          LIMIT ?;
        `,
        values: [limit, offset, limit],
      },
      {
        type: QueryTypes.SELECT,
      }
    );

    if (reclips) {
      return reclips;
    } else {
      return null;
    }
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
    return await User.create({ login, password });
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
  const user = await User.findOne({ where: { login } });
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

export async function addView(reclipId: string, userId: string) {
  if (sync === false) {
    await syncDB();
  }

  const view = await View.findOne({ where: { reclipId, userId } });

  if (view) {
    view.count += 1;
    await view.save();
  } else {
    await View.create({ reclipId, userId, count: 1 });
  }
}

export interface IAttributesReclipModel extends Attributes<IReclipModel> {}

export interface IReclipModel
  extends Model<
    InferAttributes<IReclipModel>,
    InferCreationAttributes<IReclipModel>
  > {
  id: CreationOptional<string>;
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
  id: CreationOptional<string>;
  login: string;
  password: string;
  createdAt: CreationOptional<Date>;
}

interface IViewsModel
  extends Model<
    InferAttributes<IViewsModel>,
    InferCreationAttributes<IViewsModel>
  > {
  reclipId: string;
  userId: string;
  count: CreationOptional<number>;
  createdAt: CreationOptional<Date>;
  updatedAt: CreationOptional<Date>;
}

export interface IReclipsDB extends Attributes<IReclipModel> {
  count?: number;
}
