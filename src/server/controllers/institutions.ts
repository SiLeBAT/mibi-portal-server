import { institution as Institution } from '../models/institution';

const list = (req, res, next) => {

  let query = Institution.find().lean();
  query
    .then((institutions) => {
      // res.send(institutions);
      res
        .status(200)
        .json(institutions);
    })
    .catch((err, next) => {

      res
        .json({
          title: 'Error getting all institutions',
          obj: err
        });

    });
}

export {
  list
}