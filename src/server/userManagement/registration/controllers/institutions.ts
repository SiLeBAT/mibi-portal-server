import { retrieveInstitutions } from '../interactors';

function listInstitutions(req, res, next) {

  retrieveInstitutions().then((institutions) => {
    res
      .status(200)
      .json(institutions);
  })
    .catch((err) => {

      res
        .json({
          title: 'Error getting all institutions',
          obj: err
        });

    });
}

export {
  listInstitutions
}