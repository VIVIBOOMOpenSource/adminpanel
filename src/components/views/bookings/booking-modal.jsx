import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import DateTimePicker from 'react-datetime-picker';
import MultiSelect from 'react-multi-select-component';
import { Editor } from 'react-draft-wysiwyg';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { CSVLink } from 'react-csv';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';
import { DateTime } from 'luxon';

import Button from 'src/components/common/button/button';
import CarouselHeader from 'src/components/common/carousel/carousel-header';
import Carousel from 'src/components/common/carousel/carousel';
import CrewEmails from 'src/components/common/survey-builder/components/crew-emails';
import Modal from 'src/components/common/modal/modal';
import SurveyBuilder from 'src/components/common/survey-builder/survey-builder';

import { EventType } from 'src/enums/EventType';
import { EventQuestionType } from 'src/enums/EventQuestionType';
import { EventEmailTemplateType, eventEmailTemplateTypes } from 'src/enums/EventEmailTemplateType';
import { isValidEmail } from 'src/utils/string';

import './booking-modal.scss';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

import EventApi from 'src/apis/viviboom/EventApi';
import Loading from 'src/components/common/loading/loading';
import { EventAccessType } from 'src/enums/EventAccessType';
import { EventQuestionDestinationType } from 'src/enums/EventQuestionDestinationType';
import { PublicAccessType } from 'src/enums/PublicAccessType';
import EditorApi from 'src/apis/viviboom/EditorApi';

const options = [
  { label: 'Sunday', value: 0 },
  { label: 'Monday', value: 1 },
  { label: 'Tuesday', value: 2 },
  { label: 'Wednesday', value: 3 },
  { label: 'Thursday', value: 4 },
  { label: 'Friday', value: 5 },
  { label: 'Saturday', value: 6 },
];

const bookingEndDateOptions = [
  { label: 'Event Start Time', value: 'EVENT_START' },
  { label: 'Event End Time', value: 'EVENT_END' },
  { label: '1 Hour Before Start of Event', value: 'EVENT_START_BEFORE' },
  { label: '1 Hour After Start of Event', value: 'EVENT_START_AFTER' },
  { label: '12AM on Event Day', value: 'DAY_START' },
  { label: '23:59PM on Event Day', value: 'DAY_END' },
  { label: 'Set Cutoff Date and Time', value: 'OTHER' },
];

const getBookingEndDate = (option, date, duration) => {
  switch (option) {
    case 'EVENT_START':
      return date;
    case 'EVENT_END':
      return DateTime.fromJSDate(date).plus({ hour: duration }).toJSDate();
    case 'EVENT_START_BEFORE':
      return DateTime.fromJSDate(date).minus({ hour: 1 }).toJSDate();
    case 'EVENT_START_AFTER':
      return DateTime.fromJSDate(date).plus({ hour: 1 }).toJSDate();
    case 'DAY_START':
      return DateTime.fromJSDate(date).startOf('day').toJSDate();
    case 'DAY_END':
      return DateTime.fromJSDate(date).endOf('day').toJSDate();
    default:
      return date;
  }
};

const dateTimeFormat = (navigator.language || navigator.userLanguage) === 'en-US' ? 'M / d / y   h : m   a' : 'd / M / y   H : m';
const dateFormat = (navigator.language || navigator.userLanguage) === 'en-US' ? 'M / d / y' : 'd / M / y';

function getFacilitatorArrayForUpdate(prevArr, arr) {
  return [
    // new items
    ...arr.filter((item1) => item1.id < 0).map((item) => ({ userId: item.userId, name: item.name, skills: item.skills })),
    // edit items
    ...arr.filter((item1) => prevArr.find((item2) => item1.id === item2.id)).map((item) => ({
      id: item.id, userId: item.userId, name: item.name, skills: item.skills,
    })),
    // deleted items
    ...prevArr.filter((item1) => !arr.find((item2) => item1.id === item2.id)).map((item) => ({ id: item.id, isDelete: true })),
  ];
}

function BookingModal({
  show, handleClose, refreshEventSessions, eventSession, authToCreate, authToUpdate,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'booking' });
  const user = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const defaultTitle = branch?.id === 1 ? 'Tinker Time @ Vivistop Kampong Eunos' : 'Free Flow @ VIVISTOP';

  // decide whether create or edit an event
  const isCreateEvent = !eventSession;

  const [loading, setLoading] = useState(false);
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [tab, setTab] = useState(1);
  const [isPublished, setPublished] = useState(false);
  const [isScheduledPublish, setScheduledPublish] = useState(false);
  const [publishedAt, setPublishedAt] = useState(null);

  // EVENT FORM
  // event dates
  const [date, setDate] = useState(new Date());
  // end date and daysInWeek are for bulk create only
  const [endRepeatDate, setEndRepeatDate] = useState(new Date());
  const [daysInWeek, setDaysInWeek] = useState(options); // [0, 1, 2, 3, 4, 5, 6]
  const [bookingEndDate, setBookingEndDate] = useState(new Date());
  const [bookingEndDateModified, setBookingEndDateModified] = useState(false);
  const [bookingEndDateOption, setBookingEndDateOption] = useState('EVENT_START');

  const [category, setCategory] = useState(EventType.FREE_FLOW);

  const [duration, setDuration] = useState(0);
  const [maxSlots, setMaxSlots] = useState(0);
  const [accessType, setAccessType] = useState(EventAccessType.COUNTRYWIDE);
  const [publicAccessType, setPublicAccessType] = useState(PublicAccessType.NONE);

  const [isFirstComeFirstServe, setFirstComeFirstServe] = useState(true);
  const [isOnline, setOnline] = useState(false);

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [prevFacilitators, setPrevFacilitators] = useState([]);
  const [facilitators, setFacilitators] = useState([]);
  const [crewEmails, setCrewEmails] = useState('');

  // email templates
  const [emailEditorTab, setEmailEditorTab] = useState(1);
  const [editorStateReminder, setEditorStateReminder] = useState(EditorState.createEmpty());
  const [editorStateApproved, setEditorStateApproved] = useState(EditorState.createEmpty());
  const [editorStateCancelled, setEditorStateCancelled] = useState(EditorState.createEmpty());
  const [editorStateRejected, setEditorStateRejected] = useState(EditorState.createEmpty());

  // event questions
  const [bookingQuestions, setBookingQuestions] = useState([]);
  const [checkoutQuestions, setCheckoutQuestions] = useState([]);

  // for exporting event question user response
  // const [eventQuestionUserResponses, setEventQuestionUserResponses] = useState([]);
  const [bookingQuestionUserResponses, setBookingQuestionUserResponses] = useState([]);
  const [checkoutQuestionUserResponses, setCheckoutQuestionUserResponses] = useState([]);

  const isLive = useMemo(() => eventSession && eventSession.publishedAt && new Date(eventSession.publishedAt) < new Date(), [eventSession]);
  const isGoingLive = useMemo(() => (!eventSession || !isLive) && isPublished && (!isScheduledPublish || (isScheduledPublish && publishedAt < new Date())), [eventSession, isLive, isPublished, isScheduledPublish, publishedAt]);

  async function uploadImageCallBack(image) {
    const response = await EditorApi.postImage({ authToken: user.authToken, file: image });

    return { data: { link: response.data.url } };
  }

  // load data, if exists
  useEffect(() => {
    if (eventSession) {
      setPublished(!!eventSession.publishedAt);
      if (eventSession.publishedAt && !isLive) {
        setScheduledPublish(true);
        setPublishedAt(new Date(eventSession.publishedAt));
      }

      setDate(eventSession.startAt ? new Date(eventSession.startAt) : new Date());
      setCategory(eventSession.type || EventType.FREE_FLOW);
      setDuration(eventSession.duration || 0);
      setMaxSlots(eventSession.maxSlots || 0);
      setAccessType(eventSession.accessType || EventAccessType.COUNTRYWIDE);
      setPublicAccessType(eventSession.publicAccessType || PublicAccessType.NONE);
      setFirstComeFirstServe(eventSession.isFirstComeFirstServe ?? true);
      setOnline(eventSession.isOnline ?? false);
      setTitle(eventSession.title || defaultTitle);
      setDescription(eventSession.description || '');
      setImageUri(eventSession.imageUri);
      setPrevFacilitators(eventSession.facilitators || []);
      setFacilitators(eventSession.facilitators || []);
      setCrewEmails(eventSession.crewEmails || '');
      setBookingEndDate(eventSession.bookingEndAt ? new Date(eventSession.bookingEndAt) : null);
      setBookingEndDateModified(true);
      setBookingEndDateOption('OTHER');

      // email templates
      if (eventSession.emailTemplates) {
        const type2setter = {
          [EventEmailTemplateType.APPROVAL]: setEditorStateApproved,
          [EventEmailTemplateType.CANCELLED]: setEditorStateCancelled,
          [EventEmailTemplateType.REJECTED]: setEditorStateRejected,
          [EventEmailTemplateType.REMINDER]: setEditorStateReminder,
        };

        try {
          eventSession.emailTemplates.forEach((template) => type2setter[template.type](EditorState.createWithContent(convertFromRaw(JSON.parse(template.content)))));
        } catch (err) {
          console.log(err);
          toast.error(t('Content is malformed. Please tell a crew member about this'));
        }
      }
      // event questions
      if (eventSession.eventQuestions) {
        setBookingQuestions(eventSession.eventQuestions.filter((q) => q.destination === EventQuestionDestinationType.BOOKING) || []);
        setCheckoutQuestions(eventSession.eventQuestions.filter((q) => q.destination === EventQuestionDestinationType.CHECKOUT) || []);
      }
    }
  }, [defaultTitle, eventSession, isLive, t]);

  // if the start date is later than end date, reset end date
  const handleDateChange = (newDate) => {
    if (newDate > endRepeatDate) setEndRepeatDate(new Date(newDate.toDateString()));
    setDate(newDate);
    if (!bookingEndDateModified) setBookingEndDate(getBookingEndDate(bookingEndDateOption, newDate, duration));
  };

  const handleBookingEndDateOptionChange = (e) => {
    setBookingEndDateOption(e.target.value);
    if (e.target.value !== 'OTHER') setBookingEndDate(getBookingEndDate(e.target.value, date, duration));
  };

  const handleModalClose = () => {
    handleClose();
    // reset states
    setTab(1);
    setEmailEditorTab(1);
    setPublished(false);
    setScheduledPublish(false);
    setPublishedAt(null);
    setLoading(false);
    setLoadingResponse(false);

    // delete all data
    setDate(new Date());
    setEndRepeatDate(new Date());
    setDaysInWeek(options);
    setBookingEndDate(new Date());
    setBookingEndDateModified(false);
    setBookingEndDateOption('EVENT_START');
    setCategory(EventType.FREE_FLOW);
    setDuration(0);
    setMaxSlots(0);
    setAccessType(EventAccessType.COUNTRYWIDE);
    setPublicAccessType(PublicAccessType.NONE);
    setFirstComeFirstServe(true);
    setOnline(false);
    setTitle(defaultTitle);
    setDescription('');
    setImageUri(null);
    setPrevFacilitators([]);
    setFacilitators([]);
    setCrewEmails('');
    setBookingQuestions([]);
    setCheckoutQuestions([]);

    setEditorStateReminder(EditorState.createEmpty());
    setEditorStateApproved(EditorState.createEmpty());
    setEditorStateCancelled(EditorState.createEmpty());
    setEditorStateRejected(EditorState.createEmpty());
  };

  const saveEventSession = async () => {
    // helper variable
    const type2editorState = {
      [EventEmailTemplateType.APPROVAL]: editorStateApproved,
      [EventEmailTemplateType.CANCELLED]: editorStateCancelled,
      [EventEmailTemplateType.REJECTED]: editorStateRejected,
      [EventEmailTemplateType.REMINDER]: editorStateReminder,
    };

    // Validation
    if (isPublished) {
      if ((isCreateEvent || !isLive) && isScheduledPublish && !publishedAt) return toast.error(t('Please schedule a time to publish or uncheck schedule to publish'));
      if (!date) return toast.error(t('The date and time of the event are required'));
      if (category === EventType.WORKSHOP && !title) return toast.error(t('The name of the workshop is required'));
      if (maxSlots <= 0) return toast.error(t('Maximum slots cannot be 0'));
      if (isCreateEvent && daysInWeek.length <= 0) return toast.error(t('Days selected cannot be 0'));
      if (duration <= 0) return toast.error(t('Duration of event cannot be less than or equal to 0 hours'));
      if (isCreateEvent && endRepeatDate < new Date(date.toDateString())) return toast.error(t('Start date cannot be after end date'));
      // validate crew emails
      if (crewEmails) {
        const emails = crewEmails.replaceAll(' ', '').split(',');
        const invalidEmails = emails.filter((e) => !isValidEmail(e));

        if (invalidEmails.length > 0) return toast.error(`${t('Invalid crew email')}: ${invalidEmails.join(', ')}.`);
      }
      // validate event question
      if (bookingQuestions || checkoutQuestions) {
        const eventQuestions = bookingQuestions.concat(checkoutQuestions);
        const invalidEventQuestions = eventQuestions.filter((q) => !q.question
          || (q.type === EventQuestionType.SINGLE && !q.answerOptions?.length)
          || (q.type === EventQuestionType.MULTIPLE && !q.answerOptions?.length)
          || !q.destination);

        if (invalidEventQuestions.length > 0) return toast.error(t('Invalid event questions'));
      }
    }

    // Construct request body
    const requestBody = {
      authToken: user.authToken,
      category,
      maxSlots,
      accessType,
      publicAccessType,
      duration,
      description,
      crewEmails,
      isOnline,
      isFirstComeFirstServe,
      title,
      bookingEndDate: (bookingEndDate || date)?.toISOString(),
    };
    // other fields
    if (date) requestBody.date = date.toISOString();
    if (isPublished) {
      // give published free flows a title
      if (category === EventType.FREE_FLOW && !title) requestBody.title = defaultTitle;
      if (!isScheduledPublish) requestBody.publishedAt = new Date().toISOString();
      else requestBody.publishedAt = publishedAt.toISOString();
    }

    // the remaining fields need to be handled separately
    if (isCreateEvent) {
      // POST event
      requestBody.branchId = branch.id;
      if (date && endRepeatDate && endRepeatDate > date) {
        requestBody.endRepeatDate = endRepeatDate.toISOString();
        requestBody.daysInWeek = daysInWeek.map((day) => day.value);
      }
      if (imageUri) requestBody.imageBase64 = imageUri;
      // email templates
      const emailTemplates = [];
      eventEmailTemplateTypes.forEach((templateType) => {
        const editorContent = type2editorState[templateType].getCurrentContent();
        if (editorContent.hasText()) emailTemplates.push({ type: templateType, content: JSON.stringify(convertToRaw(editorContent)) });
      });
      if (emailTemplates) requestBody.emailTemplates = emailTemplates;
      // event questions
      if (bookingQuestions || checkoutQuestions) {
        requestBody.eventQuestions = [
          ...bookingQuestions.map((q, index) => ({
            order: index + 1,
            question: q.question,
            type: q.type,
            destination: q.destination,
            options: q.answerOptions.map((o) => o.answer),
          })),
          ...checkoutQuestions.map((q, index) => ({
            order: index + 1,
            question: q.question,
            type: q.type,
            destination: q.destination,
            options: q.answerOptions.map((o) => o.answer),
          })),
        ];
      }
      if (facilitators) requestBody.facilitators = facilitators;
      // call API
      setLoading(true);
      try {
        const res = await EventApi.post(requestBody);
        if (res?.data?.eventIds.length <= 0) toast.error(t('No event was added. Please check the days selected'));
        // close modal
        handleModalClose();
        refreshEventSessions(1); // refresh to page 1
        toast.success(t('Event added'));
      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || err.message);
      }
    } else {
      // PATCH event
      requestBody.eventId = eventSession.id;
      // email templates
      const emailTemplates = [];
      eventSession.emailTemplates.forEach((template) => {
        const content = JSON.stringify(convertToRaw(type2editorState[template.type].getCurrentContent()));
        if (content !== template.content) emailTemplates.push({ type: template.type, content });
      });
      if (emailTemplates) requestBody.emailTemplates = emailTemplates;
      // event questions
      const prevEventQuestions = eventSession.eventQuestions;
      const curBookingQuestions = bookingQuestions.map((q, index) => ({ ...q, order: index + 1 }));
      const curCheckoutQuestions = checkoutQuestions.map((q, index) => ({ ...q, order: index + 1 }));
      const curEventQuestions = curBookingQuestions.concat(curCheckoutQuestions);
      requestBody.eventQuestions = [
        // new questions
        ...curEventQuestions.filter((q1) => !prevEventQuestions.find((q2) => q1.id === q2.id)).map((q) => ({
          question: q.question, options: q.answerOptions, type: q.type, destination: q.destination, order: q.order,
        })),
        // existing questions
        ...curEventQuestions.filter((q1) => prevEventQuestions.find((q2) => q1.id === q2.id)).map((q) => {
          // update options
          const prevOptions = prevEventQuestions.find((prevQ) => prevQ.id === q.id).answerOptions;
          const curOptions = q.answerOptions;
          return {
            id: q.id,
            question: q.question,
            options: [
              // new and existing answer options
              ...curOptions,
              // deleted options
              ...prevOptions.filter((o1) => !curOptions.find((o2) => o1.id === o2.id)).map((o) => ({ id: o.id, isDelete: true })),
            ],
            type: q.type,
            destination: q.destination,
            order: q.order,
          };
        }),
        // deleted questions
        ...prevEventQuestions.filter((q1) => !curEventQuestions.find((q2) => q1.id === q2.id)).map((q) => ({ id: q.id, isDelete: true })),
      ];
      // facilitators
      requestBody.facilitators = getFacilitatorArrayForUpdate(prevFacilitators, facilitators);
      // call API
      setLoading(true);
      try {
        await EventApi.patch(requestBody);
        // replace event image
        if (imageUri && !imageUri.startsWith('http')) await EventApi.putImage({ authToken: user.authToken, eventId: eventSession.id, file: imageUri });
        // close modal
        handleModalClose();
        refreshEventSessions();
        toast.success(t('Event modified'));
      } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || err.message);
      }
    }
    return setLoading(false);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    await saveEventSession();
  };

  const exportEventQuestionResponses = async (isApproved) => {
    setLoadingResponse(true);
    try {
      const res = await EventApi.getResponse({
        authToken: user.authToken,
        eventId: eventSession.id,
        isApproved,
      });
      const { responses } = res.data;
      if (responses && responses.length > 0) {
        const csvData = responses.map((resp) => {
          const csvRow = {
            username: resp.userDetails.username,
            name: `${resp.userDetails.givenName} ${resp.userDetails.familyName}`,
            email: resp.userDetails.email,
            phone: resp.userDetails.phone,
            'booking status': resp.bookingStatus,
          };

          const { userResponses } = resp;
          userResponses.forEach((response) => {
            const questionColName = `${response.question} (${response.type.toLowerCase()})`;
            if (questionColName in csvRow) csvRow[questionColName] += `. ${response.response}`;
            else csvRow[questionColName] = response.response;
          });

          return csvRow;
        });
        setBookingQuestionUserResponses(csvData);
        document.querySelector('.csv-download.booking').click();
        toast.success(t("Members' responses downloaded as a CSV file"));
      }
    } catch (err) {
      toast.error(err.message);
      console.log(err);
    }
    setLoadingResponse(false);
  };

  const exportAttendanceQuestionResponses = async () => {
    setLoadingResponse(true);
    try {
      const res = await EventApi.getAttendanceResponse({
        authToken: user.authToken,
        eventId: eventSession.id,
      });
      const { responses } = res.data;
      if (responses && responses.length > 0) {
        // group responses by attendanceId
        const csvObject = {};
        responses.forEach((resp) => {
          if (!(resp.attendanceId in csvObject)) csvObject[resp.attendanceId] = [];
          csvObject[resp.attendanceId].push(resp);
        });

        const csvData = [];
        Object.keys(csvObject).forEach((attendanceId) => {
          const respList = csvObject[attendanceId];
          const firstResp = respList[0];
          const csvRow = {
            username: firstResp.user?.username || '-',
            name: firstResp.user ? `${firstResp.user.givenName} ${firstResp.user.familyName}` : firstResp?.visitorName,
            email: firstResp.user?.guardianEmail || firstResp?.visitorEmail,
            phone: firstResp.user?.guardianPhone || firstResp?.visitorPhone,
          };
          respList.forEach((resp) => {
            const { userResponse } = resp;
            const questionColName = `${userResponse.question} (${userResponse.type.toLowerCase()})`;
            if (questionColName in csvRow) csvRow[questionColName] += `. ${userResponse.response}`;
            else csvRow[questionColName] = userResponse.response;
          });
          csvData.push(csvRow);
        });

        setCheckoutQuestionUserResponses(csvData);
        document.querySelector('.csv-download.checkout').click();
        toast.success(t("Members' responses downloaded as a CSV file"));
      } else {
        toast.error(t('No feedback record found'));
      }
    } catch (err) {
      toast.error(t('No feedback record found'));
    }
    setLoadingResponse(false);
  };

  const handleDeleteEventSession = async () => {
    if (isCreateEvent) {
      toast.error(t('This is a new event'));
      return;
    }
    if (window.confirm(t('Are you sure you want to delete this event?'))) {
      // delete booking
      setLoading(true);
      try {
        await EventApi.deleteEvent({ authToken: user.authToken, eventId: eventSession.id });
        // close modal
        toast.success(t('Event deleted'));
        handleModalClose();
        refreshEventSessions();
      } catch (err) {
        toast.error(err.message);
        console.log(err);
      }
      setLoading(false);
    }
  };

  return (
    <Modal
      className="booking-modal"
      show={show}
      handleClose={handleModalClose}
    >
      <div>
        <CarouselHeader slideTo={tab}>
          <div onClick={() => setTab(1)}>{t('Event Data')}</div>
          <div onClick={() => setTab(2)}>{t('Event Form')}</div>
          <div onClick={() => setTab(3)}>{t('Checkout Form')}</div>
          <div onClick={() => setTab(4)}>{t('Email Templates')}</div>
          <div onClick={() => setTab(5)}>{t('Danger Zone')}</div>
        </CarouselHeader>
        <Carousel slideTo={tab}>
          <div>
            <h3>
              {t(eventSession ? 'Edit an event session' : 'Create an event session')}
            </h3>
            <div className="workshop">
              <p>Event Type</p>
              <div className="event-type-button-container">
                <button
                  type="button"
                  className={category === EventType.FREE_FLOW ? 'event-type-button-active' : 'event-type-button'}
                  style={{ width: 'auto', margin: '5px' }}
                  onClick={() => { setCategory(EventType.FREE_FLOW); if (!title) setTitle(defaultTitle); }}
                >
                  <p className="text">{t(branch?.id === 1 ? 'Tinker Time' : 'Free Flow Session')}</p>
                </button>
                <button
                  type="button"
                  className={category === EventType.WORKSHOP ? 'event-type-button-active' : 'event-type-button'}
                  style={{ width: 'auto', margin: '5px' }}
                  onClick={() => { setCategory(EventType.WORKSHOP); if (title === defaultTitle) setTitle(''); }}
                >
                  <p className="text">{t('Workshop')}</p>
                </button>

                {category === EventType.WORKSHOP && (
                  <label className="event-type-details">
                    <input type="checkbox" checked={isOnline} onChange={(e) => setOnline(e.target.checked)} />
                    {t('Is this workshop online?')}
                  </label>
                )}
              </div>
            </div>
            <div className="event-name">
              {category === EventType.WORKSHOP ? (<label>{t('Event Name (Compulsory)')}</label>) : (<label>{t('Event Name')}</label>)}
              <input
                type="text"
                placeholder={category === EventType.FREE_FLOW ? defaultTitle : 'Workshop Title'}
                disabled={loading || !authToUpdate}
                onChange={(e) => setTitle(e.target.value)}
                value={title}
              />
            </div>
            <div className="date-container">
              <div className="date">
                <label>{t('Start Date and Time')}</label>
                <DateTimePicker
                  disabled={!authToUpdate}
                  value={date}
                  onChange={handleDateChange}
                  format={dateTimeFormat}
                  clearIcon={null}
                  calendarIcon={null}
                  disableClock
                />
              </div>

              {isCreateEvent && (
                <div className="date">
                  <label>{t('End Date')}</label>
                  <DateTimePicker
                    value={endRepeatDate}
                    onChange={setEndRepeatDate}
                    format={dateFormat}
                    clearIcon={null}
                    calendarIcon={null}
                    disableClock
                  />
                </div>
              )}
            </div>
            {isCreateEvent && (
              <p className="bulk-create">
                *
                {t('bulkCreate')}
              </p>
            )}

            {isCreateEvent && (
              <div className="days-picker">
                <label>{t('daysInWeek')}</label>
                <MultiSelect
                  options={options}
                  value={daysInWeek}
                  onChange={setDaysInWeek}
                  labelledBy={t('Select')}
                  disableSearch
                  overrideStrings={{
                    allItemsAreSelected: t('All days are selected'),
                    clearSearch: t('Clear Search'),
                    noOptions: t('No days selected'),
                    search: t('Search'),
                    selectAll: t('Select all'),
                    selectSomeItems: t('Select days between start and end dates...'),
                  }}
                />
              </div>
            )}

            <div className="last-register-container">
              <label>{t('Event Registration Cut Off Date/Time')}</label>
              <div className="last-register-inputs">
                {isCreateEvent && (
                  <select
                    className="last-register-select"
                    onChange={handleBookingEndDateOptionChange}
                    value={bookingEndDateOption}
                    disabled={loading || !authToUpdate}
                    required
                  >
                    {bookingEndDateOptions.map((option) => <option key={option.value} value={option.value}>{t(option.label)}</option>)}
                  </select>
                )}
                <div className="date">
                  <DateTimePicker
                    disabled={bookingEndDateOption !== 'OTHER' || loading || !authToUpdate}
                    value={bookingEndDate}
                    onChange={(newDate) => { setBookingEndDate(newDate); setBookingEndDateModified(true); }}
                    format={dateTimeFormat}
                    clearIcon={null}
                    calendarIcon={null}
                    disableClock
                  />
                </div>
              </div>
            </div>

            <div className={isCreateEvent ? 'time' : 'time show-booking'}>
              <label>{t('Duration (in hours)')}</label>
              <input
                type="number"
                min="0"
                step="any"
                placeholder="Duration"
                disabled={loading || !authToUpdate}
                onChange={(e) => { setDuration(e.target.value); if (bookingEndDateOption === 'EVENT_END') setBookingEndDate(getBookingEndDate('EVENT_END', date, e.target.value)); }}
                value={duration}
              />
            </div>

            <div>
              <label>{t('Maximum Slots')}</label>
              <input
                type="number"
                min="0"
                placeholder={t('Maximum Slots')}
                disabled={loading || !authToUpdate}
                onChange={(e) => setMaxSlots(e.target.value)}
                value={maxSlots}
              />
            </div>

            <div className="slots">
              <label>{t('Event Access')}</label>
              <select
                className="event-access-select"
                onChange={(e) => setAccessType(e.target.value)}
                value={accessType}
                disabled={loading || !authToUpdate}
                required
              >
                <option value="" disabled hidden>{t('Choose here')}</option>
                <option value={EventAccessType.BRANCH_ONLY}>{t('Branch Only Event')}</option>
                <option value={EventAccessType.COUNTRYWIDE}>{t('Countrywide Event')}</option>
                <option value={EventAccessType.GLOBAL}>{t('Global Event')}</option>
              </select>
            </div>

            <div className="slots">
              <label>{t('Event Public Access')}</label>
              <select
                className="event-access-select"
                onChange={(e) => setPublicAccessType(e.target.value)}
                value={publicAccessType}
                disabled={loading || !authToUpdate}
                required
              >
                <option value="" disabled hidden>{t('Choose here')}</option>
                <option value={PublicAccessType.NONE}>{t('Only members can view and book')}</option>
                <option value={PublicAccessType.VIEW}>{t('Public can view, but only members can book')}</option>
                <option value={PublicAccessType.BOOK}>{t('Public and members can view and book')}</option>
                <option value={PublicAccessType.PUBLIC_ONLY}>{t('Only public can view and book')}</option>
              </select>
            </div>
            <label>
              <input
                type="checkbox"
                checked={isFirstComeFirstServe}
                disabled={!authToUpdate}
                onChange={(e) => setFirstComeFirstServe(e.target.checked)}
              />
              {t('firstComeFirstServe')}
            </label>
            <div className="ready-publish">
              {!eventSession?.publishedAt && (
                <label>
                  <input type="checkbox" disabled={!authToCreate} checked={isPublished} onChange={(e) => setPublished(e.target.checked)} />
                  {t('ready to publish?')}
                </label>
              )}
            </div>
            {isPublished && (
              <div className="schedule-date">
                {!isLive ? (
                  <label>
                    <input type="checkbox" disabled={!authToCreate} checked={isScheduledPublish} onChange={(e) => setScheduledPublish(e.target.checked)} />
                    {t('schedule a time to publish? (if unchecked, event will go live immediately)')}
                  </label>
                ) : `*${t('Published on')} ${DateTime.fromISO(eventSession?.publishedAt).toLocaleString(DateTime.DATETIME_MED)}`}
              </div>
            )}
            {isPublished && isScheduledPublish && (
              <div className="publish-date">
                <label>{t('Session will be available to members on:')}</label>
                <DateTimePicker
                  disabled={!authToUpdate}
                  value={publishedAt}
                  onChange={setPublishedAt}
                  format={dateTimeFormat}
                  clearIcon={null}
                  calendarIcon={null}
                  disableClock
                />
              </div>
            )}
          </div>
          {/* Tab 2 */}
          <div className="workshop-form">
            <h3>
              {t('Event Form')}
            </h3>
            <SurveyBuilder
              isCreateEvent={isCreateEvent}
              authToUpdate={authToUpdate}
              title={title}
              description={description}
              imageUri={imageUri}
              questions={bookingQuestions}
              facilitators={facilitators}
              setDescription={setDescription}
              setImageUri={setImageUri}
              setQuestions={setBookingQuestions}
              setFacilitators={setFacilitators}
              isWorkshopSurvey
            />
            {!isCreateEvent && isLive && (
              <div className="export-buttons">
                <button
                  type="button"
                  className="export-button button"
                  onClick={() => exportEventQuestionResponses(undefined)}
                >
                  {t('Export All User Responses')}
                </button>
                <button
                  type="button"
                  className="export-button button"
                  onClick={() => exportEventQuestionResponses(true)}
                >
                  {t('Export Approved User Responses')}
                </button>
                <Loading show={loadingResponse} size="40px" />
                <CSVLink
                  data={bookingQuestionUserResponses}
                  className="csv-download booking"
                  filename={
                    bookingQuestionUserResponses.length === 0
                      ? ''
                      : `${eventSession?.title}_booking_responses_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}.csv`
                  }
                />
              </div>
            )}
          </div>
          {/* Tab 3 */}
          <div className="workshop-form">
            <h3>
              {t('Checkout Form')}
            </h3>
            <SurveyBuilder
              isCreateEvent={isCreateEvent}
              authToUpdate={authToUpdate}
              title={title}
              description={description}
              imageUri={imageUri}
              crewEmails={crewEmails}
              questions={checkoutQuestions}
              setTitle={setTitle}
              setDescription={setDescription}
              setImageUri={setImageUri}
              setCrewEmails={setCrewEmails}
              setQuestions={setCheckoutQuestions}
              isWorkshopSurvey={false}
            />
            {!isCreateEvent && isLive && (
              <div>
                <button
                  type="button"
                  className="button"
                  style={{ width: '300px', margin: '8px auto' }}
                  onClick={exportAttendanceQuestionResponses}
                >
                  {t('Export All Checkout Responses')}
                </button>
                <Loading show={loadingResponse} size="40px" />
                <CSVLink
                  data={checkoutQuestionUserResponses}
                  className="csv-download checkout"
                  filename={
                    checkoutQuestionUserResponses.length === 0
                      ? ''
                      : `${eventSession?.title}_checkout_responses_${new Date().toLocaleDateString()}_${new Date().toLocaleTimeString()}.csv`
                  }
                />
              </div>
            )}
          </div>
          {/* Tab 4 */}
          <div>
            <CrewEmails crewEmails={crewEmails} handleChangeCrewEmails={(e) => setCrewEmails(e.target.value)} authToUpdate={authToUpdate} />
            <h3>{t('Customise Emails')}</h3>

            <CarouselHeader slideTo={emailEditorTab}>
              <div onClick={() => setEmailEditorTab(1)}>{t('Reminder')}</div>
              <div onClick={() => setEmailEditorTab(2)}>{t('Approved')}</div>
              <div onClick={() => setEmailEditorTab(3)}>{t('Rejected')}</div>
              <div onClick={() => setEmailEditorTab(4)}>{t('Cancelled')}</div>
            </CarouselHeader>
            {/* have a reset button? */}

            <p>
              <strong>Important</strong>
              : if this is left blank at the time of creation, it will use the default template.
            </p>
            <p>
              If an email tag is included, it will be replaced with the content (depending on whether the booking is for a free flow or workshop)
              when the email is sent to the user.
            </p>

            <table className="email-tags">
              <thead>
                <tr>
                  <th>Email Tag</th>
                  <th>Content (free-flow)</th>
                  <th>Content (workshop)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>%free_flow_or_workshop%</td>
                  <td>free flow session</td>
                  <td>workshop</td>
                </tr>

                <tr>
                  <td>%free_flow_or_workshop_booking%</td>
                  <td>free flow session event</td>
                  <td>workshop event</td>
                </tr>

                <tr>
                  <td>%workshop_title%</td>
                  <td>
                    <i>empty</i>
                  </td>
                  <td>Meet and Make - Carve Away</td>
                </tr>

                <tr>
                  <td>%workshop_title_header%</td>
                  <td>
                    <i>empty</i>
                  </td>
                  <td>Workshop Title: Meet and Make - Carve Away</td>
                </tr>

                <tr>
                  <td>%date%</td>
                  <td colSpan={2}>Tuesday, Jun 01 2021</td>
                </tr>

                <tr>
                  <td>%time%</td>
                  <td colSpan={2}>2:00PM</td>
                </tr>

                <tr>
                  <td>%location%</td>
                  <td colSpan={2}>10 Kampong Eunos, Singapore 417775</td>
                </tr>

                <tr>
                  <td>%child_given_name%</td>
                  <td colSpan={2}>John</td>
                </tr>

                <tr>
                  <td>%child_family_name%</td>
                  <td colSpan={2}>Doe</td>
                </tr>

                <tr>
                  <td>%child_full_name%</td>
                  <td colSpan={2}>John Doe</td>
                </tr>

                <tr>
                  <td>%cancellation_message%</td>
                  <td>Your quota for this month will be refunded to you.</td>
                  <td>As this booking was cancelled less than 48 hours before the booking, your quota for the month has been used.</td>
                </tr>

                <tr>
                  <td>%safety_message%</td>
                  <td colSpan={2}>
                    Please remember to come in covered shoes as safety is of utmost importance in the space :).
                    <br />
                    If you are feeling unwell, please do cancel your booking and stay at home to rest!
                  </td>
                </tr>
              </tbody>
            </table>
            <Carousel slideTo={emailEditorTab}>
              <div>
                <Editor
                  editorState={editorStateReminder}
                  toolbarClassName="toolbar"
                  wrapperClassName="wrapper"
                  editorClassName="editor"
                  toolbarHidden={false}
                  readOnly={!authToUpdate}
                  onEditorStateChange={setEditorStateReminder}
                  toolbar={{
                    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'history', 'image'],
                    image: {
                      popupClassName: 'rdw-image-popup',
                      previewImage: true,
                      uploadEnabled: true,
                      uploadCallback: uploadImageCallBack,
                    },
                  }}
                />
              </div>
              <div>
                <Editor
                  editorState={editorStateApproved}
                  toolbarClassName="toolbar"
                  wrapperClassName="wrapper"
                  editorClassName="editor"
                  toolbarHidden={false}
                  readOnly={!authToUpdate}
                  onEditorStateChange={setEditorStateApproved}
                  toolbar={{
                    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'history', 'image'],
                    image: {
                      popupClassName: 'rdw-image-popup',
                      previewImage: true,
                      uploadEnabled: true,
                      uploadCallback: uploadImageCallBack,
                    },
                  }}
                />
              </div>
              <div>
                <Editor
                  editorState={editorStateRejected}
                  toolbarClassName="toolbar"
                  wrapperClassName="wrapper"
                  editorClassName="editor"
                  toolbarHidden={false}
                  readOnly={!authToUpdate}
                  onEditorStateChange={setEditorStateRejected}
                  toolbar={{
                    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'history', 'image'],
                    image: {
                      popupClassName: 'rdw-image-popup',
                      previewImage: true,
                      uploadEnabled: true,
                      uploadCallback: uploadImageCallBack,
                    },
                  }}
                />
              </div>
              <div>
                <Editor
                  editorState={editorStateCancelled}
                  toolbarClassName="toolbar"
                  wrapperClassName="wrapper"
                  editorClassName="editor"
                  toolbarHidden={false}
                  readOnly={!authToUpdate}
                  onEditorStateChange={setEditorStateCancelled}
                  toolbar={{
                    options: ['inline', 'blockType', 'fontSize', 'fontFamily', 'list', 'textAlign', 'colorPicker', 'link', 'history', 'image'],
                    image: {
                      popupClassName: 'rdw-image-popup',
                      previewImage: true,
                      uploadEnabled: true,
                      uploadCallback: uploadImageCallBack,
                    },
                  }}
                />
              </div>
            </Carousel>
          </div>

          <div>
            <h3>{t('Danger Zone')}</h3>
            {isLive ? (
              <label>
                {t('Deletes this event and')}
                {' '}
                <strong style={{ color: 'red' }}>{t('all bookings')}</strong>
                {' '}
                {t('for this event')}
                !
              </label>
            ) : (
              <label>{t('Delete this event?')}</label>
            )}
            <br />
          </div>
        </Carousel>
        <div>
          {tab === 5 ? (
            <Button
              status={loading ? 'loading' : 'delete'}
              disabled={!authToCreate}
              onClick={handleDeleteEventSession}
            >
              {t('Delete Event')}
            </Button>
          ) : (
            <div className="save-buttons">
              <Button
                type="submit"
                parentClassName={isGoingLive ? 'publish-btn warning' : 'publish-btn'}
                status={loading ? 'loading' : 'save'}
                disabled={!authToCreate}
                value={`${eventSession?.publishedAt ? t('Save') : `${isPublished ? t('Publish') : t('Save Draft')}`} ${isGoingLive ? t('(go live)') : ''}`}
                onClick={handleSubmitForm}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default BookingModal;
