const ProjectStatusEnum = {
  WorkInProgress: 0, // was draft
  Completed: 1, // was rejected
};

const ProjectBadgeStatusEnum = {
  BadgesSubmitted: 0,
  BadgesApproved: 1,
};
const displayProjectStatusLabelById = (id) => {
  var label = "Null";
  switch (parseInt(id)) {
    case ProjectStatusEnum.WorkInProgress:
      label = "Work In Progress";
      break;
    case ProjectStatusEnum.Completed:
      label = "Completed";
      break;
    default:
      break;
  }
  return label;
};

const displayProjectBadgeStatusLabelById = (id) => {
  var label = "Null";
  switch (parseInt(id)) {
    case ProjectBadgeStatusEnum.BadgesSubmitted:
      label = "Submitted";
      break;
    case ProjectBadgeStatusEnum.BadgesApproved:
      label = "Approved";
      break;
    default:
      break;
  }
  return label;
};

module.exports = {
  ProjectStatusEnum,
  ProjectBadgeStatusEnum,
  displayProjectStatusLabelById,
  displayProjectBadgeStatusLabelById,
};
