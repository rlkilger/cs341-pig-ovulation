import { connectToDatabase, Pig } from '$lib/models';
import { userNeedsToLogin } from '$lib/guards';



export const get = async (req, res) => {
  return {
    status: 200,
    body: {
      pig: await Pig.getById(req.body.pigId),
    }
  }
}

export const post = async (req, res) => {
  // Verify the user is logged in otherwise move on
  if (await userNeedsToLogin({
    // We have to kind of jankily pass the path we're on here. Not sure if there's
    // a more dynamic way to do this right now
    page: { path: '/pigs/getpig' },
    session: req.locals
  })) {
    // Here we re-direct to the login page if the user isn't authorized
    return {
      status: 302,
      headers: {
        location: '/login'
      },
    };
  }

  await connectToDatabase();

  if (req.body !== undefined && req.body.pigId !== undefined) {
    const pig = await Pig.getById(req.body.pigId);

    // console.log(pig);
    return {
      status: 200,
      body: {
        pig
      }
    }
  };

  return {
    status: 301,
    redirect: '/farms',
  }
}
