import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import './user-registration-form-ee.scss';

import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import ReactSignatureCanvas from 'react-signature-canvas';
import JsPDF from 'jspdf';
import { DateTime } from 'luxon';

import { ReactComponent as Back } from 'src/css/imgs/icon-arrow-back.svg';
import { ReactComponent as Check } from 'src/css/imgs/icon-check.svg';

import Button from 'src/components/common/button/button';
import PasswordInput from 'src/components/common/password-input/password-input';
import DobPicker from 'src/components/common/dob-picker/dob-picker';

import UserApi from 'src/apis/viviboom/UserApi';
import UserPDF from './user-registration-pdf-global';

const termsLink = 'https://drive.google.com/file/d/1CF4UFqX09WO3nbDiqQgmGUmrkg_DIln4/view?usp=sharing';
const privacyPolicyLink = 'https://vivita.club/privacy/';

const welcomeVideoLink = 'https://www.youtube.com/embed/mSht4hQuypg';

const usernameRegex = '^(?=.{5,18}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$';

function UserRegistrationFormEE({
  authToCreate, userId,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'userRegistration' });
  const loggedInUser = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isNewForm, setNewForm] = useState(true);
  const [user, setUser] = useState();

  const [showSecondGuardianFields, setShowSecondGuardianFields] = useState(false);
  const [userEdit, setUserEdit] = useState({});
  const [agreementChecks, setAgreementChecks] = useState([false, false, false, false, false]);

  const [showSignaturePad, setShowSignaturePad] = useState(null);
  const [signatureUrls, setSignatureUrls] = useState({ member: null, guardian: null });

  const isCreateUser = !userId;

  const signatureRef = useRef();

  const branchInfo = {
    entityName: 'VIVITA Tallinn',
    registryCode: '',
    address: 'Telliskivi 60A/5 10412, Tallinn',
    studio: '',
    email: '',
    jurisdiction: 'Estonia',
    minimumMembershipAge: '8',
  };

  const handeAgreementCheckChange = (index) => (e) => {
    const newAgreementChecks = [...agreementChecks];
    newAgreementChecks[index] = e.target.checked;
    setAgreementChecks(newAgreementChecks);
  };

  const handleSignatureClick = (signatureType) => () => {
    setShowSignaturePad(signatureType);
  };

  const onSignatureSubmit = useCallback(() => {
    setShowSignaturePad(null);
    setSignatureUrls({ ...signatureUrls, [showSignaturePad]: signatureRef.current.getTrimmedCanvas().toDataURL('image/png') });
  }, [showSignaturePad, signatureUrls]);

  // 1 => 2
  const handleProceed = (e) => {
    e.preventDefault();
    if (!userEdit?.dob) {
      toast.error('The date selected does not exist');
      return;
    }
    if (userEdit.guardianEmail && (userEdit.guardianEmail === userEdit.guardianEmailTwo)) {
      toast.error('Both guardians cannot have the same email address');
      return;
    }
    document.getElementById('sign-up-form').scrollIntoView({ behavior: 'smooth' });
    setNewForm(false);
    setPage(2);
  };

  // 3 => 1
  const handleStartNewForm = () => {
    setNewForm(true);
    document.getElementById('sign-up-form').scrollIntoView({ behavior: 'smooth' });
    setShowSecondGuardianFields(false);
    setPage(1);
  };

  useEffect(() => {
    if (isNewForm) {
      setUserEdit({
        givenName: '',
        familyName: '',
        gender: '',
        dob: '',
        school: '',
        educationLevel: '',
        email: '',
        phone: '',
        guardianName: '',
        guardianRelationship: '',
        guardianEmail: '',
        guardianPhone: '',
        guardianNameTwo: '',
        guardianRelationshipTwo: '',
        guardianEmailTwo: '',
        guardianPhoneTwo: '',
        address: '',
        branchId: branch?.id,
        username: '',
        password: '',
      });
      setUser();
      setAgreementChecks([false, false, false, false, false]);
      setSignatureUrls({ member: null, guardian: null });
    }
  }, [branch, isNewForm]);

  function clearSecondGuardianFields() {
    setUserEdit({
      ...userEdit,
      guardianNameTwo: '',
      guardianRelationshipTwo: '',
      guardianEmailTwo: '',
      guardianPhoneTwo: '',
    });
  }

  function toggleSecondGuardianButton() {
    setShowSecondGuardianFields(!showSecondGuardianFields);
    if (showSecondGuardianFields) {
      clearSecondGuardianFields();
    }
  }

  // 2 => 3
  const onSubmitForm = useCallback(async (evt) => {
    evt.preventDefault();

    if (!agreementChecks.reduce((prev, cur) => prev && cur, true)) {
      toast.error('Please agree with ALL the Terms and Conditions');
      return;
    }
    if (!signatureUrls.guardian) {
      toast.error("Please provide Guardian's Signature");
      return;
    }

    if (isCreateUser && userEdit?.password !== userEdit.confirmPassword) {
      toast.error('Passwords Mismatched');
      return;
    }

    const requestParams = {
      givenName: userEdit.givenName,
      familyName: userEdit.familyName,
      gender: userEdit.gender.toUpperCase(),
      dob: DateTime.fromJSDate(userEdit.dob).toFormat('yyyy-LL-dd'),
      school: userEdit.school,
      educationLevel: userEdit.educationLevel,
      guardianName: userEdit.guardianName,
      guardianRelationship: userEdit.guardianRelationship.toUpperCase(),
      guardianEmail: userEdit.guardianEmail,
      guardianPhone: userEdit.guardianPhone,
      address: userEdit.address,
      branchId: isCreateUser ? userEdit.branchId : undefined,
      username: isCreateUser ? userEdit.username : undefined,
      newPassword: isCreateUser ? userEdit.password : undefined,
      mediaReleaseConsent: Number(agreementChecks[4]),
    };

    if (userEdit?.email) requestParams.email = userEdit.email;
    if (userEdit?.phone) requestParams.phone = userEdit.phone;
    if (userEdit?.guardianNameTwo) requestParams.guardianNameTwo = userEdit.guardianNameTwo;
    if (userEdit?.guardianRelationshipTwo) requestParams.guardianRelationshipTwo = userEdit.guardianRelationshipTwo.toUpperCase();
    if (userEdit?.guardianPhoneTwo) requestParams.guardianPhoneTwo = userEdit.guardianPhoneTwo;
    if (userEdit?.guardianEmailTwo) requestParams.guardianEmailTwo = userEdit.guardianEmailTwo;

    setLoading(true);
    try {
      let newUserId;
      if (isCreateUser) {
        const res = await UserApi.post({ authToken: loggedInUser.authToken, ...requestParams });
        setUser(res.data?.user);
        newUserId = res.data?.user?.id;
        setUserEdit({ ...userEdit, id: newUserId });
      } else {
        await UserApi.patch({ authToken: loggedInUser.authToken, userId: userEdit?.id, ...requestParams });
      }

      // generating PDF
      const doc = new JsPDF({ format: 'letter' });
      doc.html(document.getElementById('create-user-pdf-global'), {
        callback: async (d) => {
          const blob = d.output('blob');
          // put pdf file to backend
          await UserApi.putRegistrationForm({ authToken: loggedInUser.authToken, userId: newUserId || userEdit?.id, file: blob });
        },
        width: 216,
        windowWidth: 816,
      });
      setPage(3); // success page
      toast.success(isCreateUser ? 'Successfully created account!' : 'Successfully edited account!');
      document.getElementById('sign-up-form').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      toast(err?.response?.data?.message || err.message);
    }
    setLoading(false);
  }, [agreementChecks, signatureUrls?.guardian, isCreateUser, userEdit, loggedInUser?.authToken]);

  const fetchUser = useCallback(async () => {
    if (!loggedInUser?.authToken) return;
    if (user?.id || !userId) return;
    setLoading(true);
    try {
      const res = await UserApi.get({ authToken: loggedInUser.authToken, userId });
      setUserEdit({ ...res.data?.user, dob: res.data?.user?.dob ? new Date(res.data?.user?.dob) : null });
      setUser(res.data?.user);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [loggedInUser.authToken, user?.id, userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (!authToCreate) return <h1>404 Not Found</h1>;
  return (
    <>
      <UserPDF user={userEdit} signatureUrls={signatureUrls} verifiedBy={loggedInUser.name} branchInfo={branchInfo} />
      <div className="sign-up-page-es">
        <h1 className="info-title">{t('VIVINAUT Agreement')}</h1>
        <p className="sign-up-description">{t("Let's get you all set up so you can start your No Limits journey with us!")}</p>
        <div className="sign-up-form" id="sign-up-form">
          {page === 1 && (
            <div>
              <form onSubmit={handleProceed}>
                <div className="form-content">
                  <h3 className="section-title-top">{t("VIVINAUT's Particulars")}</h3>
                  <label>
                    {t("VIVINAUT's Given Name*")}
                  </label>
                  <input
                    className="text-input"
                    type="text"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, givenName: e.target.value }); }}
                    value={userEdit?.givenName || ''}
                    required
                  />

                  <label>
                    {t("VIVINAUT's Family Name*")}
                  </label>
                  <input
                    className="text-input"
                    type="text"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, familyName: e.target.value }); }}
                    value={userEdit?.familyName || ''}
                    required
                  />

                  <label>
                    {t("VIVINAUT's Gender*")}
                  </label>
                  <select
                    className="text-input"
                    onChange={(e) => { setUserEdit({ ...userEdit, gender: e.target.value }); }}
                    value={userEdit?.gender?.toLowerCase()}
                    disabled={loading}
                    required
                  >
                    <option value="" disabled hidden>{t('Choose here')}</option>
                    <option value="male">{t('Male')}</option>
                    <option value="female">{t('Female')}</option>
                    <option value="other">{t('Other')}</option>
                  </select>

                  <label>
                    {t("VIVINAUT's Date of Birth*")}
                  </label>
                  <DobPicker
                    className="dob-input"
                    defaultValue={user?.dob}
                    onChange={(e) => { setUserEdit({ ...userEdit, dob: e }); }}
                  />

                  <label>
                    {t('School*')}
                  </label>
                  <input
                    className="text-input"
                    type="text"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, school: e.target.value }); }}
                    value={userEdit?.school || ''}
                    required
                  />

                  <label>
                    {t("VIVINAUT's Education Level*")}
                  </label>
                  <select
                    className="text-input"
                    onChange={(e) => { setUserEdit({ ...userEdit, educationLevel: e.target.value }); }}
                    value={userEdit?.educationLevel}
                    disabled={loading}
                    required
                  >
                    <option value="" disabled hidden>{t('Choose here')}</option>
                    <option value="grade 1">Grade 1</option>
                    <option value="grade 2">Grade 2</option>
                    <option value="grade 3">Grade 3</option>
                    <option value="grade 4">Grade 4</option>
                    <option value="grade 5">Grade 5</option>
                    <option value="grade 6">Grade 6</option>
                    <option value="grade 7">Grade 7</option>
                    <option value="grade 8">Grade 8</option>
                    <option value="grade 9">Grade 9</option>
                    <option value="grade 10">Grade 10</option>
                    <option value="grade 11">Grade 11</option>
                    <option value="grade 12">Grade 12</option>
                  </select>

                  <label>{t("VIVINAUT's Email (optional)")}</label>
                  <input
                    className="text-input"
                    type="text"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, email: e.target.value }); }}
                    value={userEdit?.email || ''}
                  />

                  <label>{t("VIVINAUT's Phone Number (optional)")}</label>
                  <input
                    className="text-input"
                    type="number"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, phone: e.target.value }); }}
                    value={userEdit?.phone || ''}
                  />

                  <h3 className="section-title">{t("Guardian's Particulars")}</h3>
                  {showSecondGuardianFields && (<h4 className="subsection-title">{t("First Guardian's Particulars")}</h4>)}
                  <label>
                    {t("Guardian's Full Name*")}
                  </label>
                  <input
                    className="text-input"
                    type="text"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, guardianName: e.target.value }); }}
                    value={userEdit?.guardianName || ''}
                    required
                  />

                  <label>
                    {t('Relationship*')}
                  </label>
                  <select
                    className="text-input"
                    onChange={(e) => { setUserEdit({ ...userEdit, guardianRelationship: e.target.value }); }}
                    value={userEdit?.guardianRelationship}
                    disabled={loading}
                    required
                  >
                    <option value="" disabled hidden>{t('Choose here')}</option>
                    <option value="father">{t('Father')}</option>
                    <option value="mother">{t('Mother')}</option>
                    <option value="legal_guardian">{t('Legal guardian')}</option>
                  </select>

                  <label>
                    {t('Residential Address*')}
                  </label>
                  <input
                    className="text-input"
                    type="text"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, address: e.target.value }); }}
                    value={userEdit?.address || ''}
                    required
                  />

                  <label>
                    {t("Guardian's Email*")}
                  </label>
                  <input
                    className="text-input"
                    type="email"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, guardianEmail: e.target.value }); }}
                    value={userEdit?.guardianEmail || ''}
                    required
                  />

                  <label>{t("Guardian's Phone Number*")}</label>
                  <input
                    className="text-input"
                    type="number"
                    disabled={loading}
                    onChange={(e) => { setUserEdit({ ...userEdit, guardianPhone: e.target.value }); }}
                    value={userEdit?.guardianPhone || ''}
                    required
                  />
                  {showSecondGuardianFields && (
                  <>
                    <h4 className="subsection-title second-guardian">{t("Second Guardian's Particulars")}</h4>
                    <label>
                      {t("Second Guardian's Full Name*")}
                    </label>
                    <input
                      className="text-input"
                      type="text"
                      disabled={loading}
                      onChange={(e) => { setUserEdit({ ...userEdit, guardianNameTwo: e.target.value }); }}
                      value={userEdit?.guardianNameTwo || ''}
                      required
                    />

                    <label>
                      {t('Relationship*')}
                    </label>
                    <select
                      className="text-input"
                      onChange={(e) => { setUserEdit({ ...userEdit, guardianRelationshipTwo: e.target.value }); }}
                      value={userEdit?.guardianRelationshipTwo}
                      disabled={loading}
                      required
                    >
                      <option value="" disabled hidden>{t('Choose here')}</option>
                      <option value="father">{t('Father')}</option>
                      <option value="mother">{t('Mother')}</option>
                      <option value="legal_guardian">{t('Legal guardian')}</option>
                    </select>

                    <label>
                      {t("Second Guardian's Email*")}
                    </label>
                    <input
                      className="text-input"
                      type="email"
                      disabled={loading}
                      onChange={(e) => { setUserEdit({ ...userEdit, guardianEmailTwo: e.target.value }); }}
                      value={userEdit?.guardianEmailTwo || ''}
                      required
                    />

                    <label>{t("Second Guardian's Phone Number*")}</label>
                    <input
                      className="text-input"
                      type="number"
                      disabled={loading}
                      onChange={(e) => { setUserEdit({ ...userEdit, guardianPhoneTwo: e.target.value }); }}
                      value={userEdit?.guardianPhoneTwo || ''}
                      required
                    />
                  </>
                  )}
                  <div className="add-second-guardian" onClick={toggleSecondGuardianButton}>
                    {t(showSecondGuardianFields ? 'Remove Second Guardian' : 'Add Second Guardian')}
                  </div>
                </div>
                <div className="button-container">
                  <Button parentClassName="submit-form" type="submit" status={loading ? 'loading' : 'save'} value={t('Next')} />
                </div>
              </form>
            </div>
          )}
          {page === 2 && (
            <div>
              <div className="back-button" onClick={() => setPage(1)}>
                <Back />
              </div>
              <form onSubmit={onSubmitForm}>
                <div className="form-content">
                  {isCreateUser && (
                    <>
                      <h3 className="section-title">{t('VIVIBOOM Username and Password')}</h3>

                      <label>
                        {t('Username*')}
                      </label>
                      <input
                        className="text-input"
                        type="text"
                        disabled={loading}
                        onChange={(e) => { setUserEdit({ ...userEdit, username: e.target.value }); }}
                        value={userEdit?.username || ''}
                        pattern={usernameRegex}
                        title="Username must be made of 5-18 alphanumeric characters"
                        placeholder={t('At least {{count}} characters required', { count: 5 })}
                        required
                      />

                      <label>{t('Password*')}</label>
                      <PasswordInput
                        className="text-input"
                        disabled={loading}
                        onChange={(e) => { setUserEdit({ ...userEdit, password: e.target.value }); }}
                        value={userEdit?.password || ''}
                        pattern=".{8,}"
                        title={t('characters minimum', { count: 8 })}
                        placeholder={t('At least {{count}} characters required', { count: 8 })}
                        required
                      />

                      <label>{t('Confirm Password*')}</label>
                      <PasswordInput
                        className="text-input"
                        disabled={loading}
                        onChange={(e) => { setUserEdit({ ...userEdit, confirmPassword: e.target.value }); }}
                        value={userEdit?.confirmPassword || ''}
                        pattern=".{8,}"
                        title={t('characters minimum', { count: 8 })}
                        required
                      />
                    </>
                  )}

                  <div className="agreements">
                    <p className="subsection-title">As a Guardian / Parent, I consent and/or agree to the following:</p>
                    <p>
                      <input type="checkbox" checked={agreementChecks[0]} onChange={handeAgreementCheckChange(0)} />
                      {' '}
                      {' '}
                      I have read and agree to the
                      {' '}
                      <b><a href={termsLink} target="_blank" rel="noreferrer" className="link">Membership Terms and Conditions</a></b>
                      .
                    </p>
                    <p>
                      <input type="checkbox" checked={agreementChecks[1]} onChange={handeAgreementCheckChange(1)} />
                      {' '}
                      {' '}
                      I have read and agree to
                      {' '}
                      <b className="bolded-agreement">VIVITA's Internal Rules regarding online services</b>
                      {' '}
                      and to the
                      {' '}
                      <b><a href={privacyPolicyLink} target="_blank" rel="noreferrer" className="link">Privacy Policy</a></b>
                      .
                    </p>
                    <p>
                      <input type="checkbox" checked={agreementChecks[2]} onChange={handeAgreementCheckChange(2)} />
                      {' '}
                      {' '}
                      I consent and give permission for my Child to start using the VIVIBOOM educational portal.
                    </p>
                    <p>
                      <input type="checkbox" checked={agreementChecks[3]} onChange={handeAgreementCheckChange(3)} />
                      {' '}
                      {' '}
                      I have read and agree to the
                      {' '}
                      <b className="bolded-agreement">Liability Waiver and Release</b>
                      .
                    </p>
                    <p>
                      <input type="checkbox" checked={agreementChecks[4]} onChange={handeAgreementCheckChange(4)} />
                      {' '}
                      {' '}
                      I consent and give permission to VIVITA to take photographs and/or video of my minor child(ren) while participating in VIVITA's workshops and activities, and consent to the publication of these photographs and/or video by VIVITA for any legal use, including for publicity, social media, and web content.
                    </p>
                    <p style={{ marginTop: 30 }}>
                      By signing below, I am certifying that: (1) I have read this document, understand it, and sign voluntarily and without any inducement; (2) I am at least 18 years of age and am of sound mind; and (3) I am the legal guardian of the minor child(ren) listed above and sign this Agreement on their behalf. I further certify that: (4) the minor child(ren) listed above is in good health and has no conditions or impairments which would preclude his/her safe participation in VIVITA's workshop and activities and (5) the minor child(ren) listed above is at least
                      {' '}
                      {branchInfo.minimumMembershipAge}
                      {' '}
                      years of age. These Membership Terms & Conditions shall be governed by and construed in accordance with the laws of the
                      {' '}
                      {branchInfo.jurisdiction}
                      .
                    </p>
                  </div>
                </div>

                <div className="signature-section">
                  <p className="subsection-title">{t("Guardian's Signature")}</p>
                  <div className="signatures">
                    <div className="signature">
                      <div className="sig-title">{t("Guardian's Signature:")}</div>
                      <div className="sig-img" onClick={handleSignatureClick('guardian')}>
                        {signatureUrls.guardian ? <img src={signatureUrls.guardian} alt="guardian's signature" /> : t('Click here to sign')}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="button-container">
                  <Button parentClassName="submit-form" type="submit" status={loading ? 'loading' : 'save'} value={t('Create My Account')} />
                </div>
              </form>
            </div>
          )}
          {page === 3 && (
            <div className="success-page">
              <div className="back-button" onClick={handleStartNewForm}>
                <Back />
              </div>
              <h2 className="welcome-info-pretitle">{t('WELCOME TO')}</h2>
              <h1 className="welcome-info-title">VIVIBOOM</h1>
              <h3 className="email-sent">
                {t('Confirmation email sent')}
              </h3>
              <p className="user-email">{user?.guardianEmail}</p>
              {user?.guardianEmailTwo
              && user?.guardianEmailTwo !== user?.guardianEmail && <p className="user-email">{user?.guardianEmailTwo}</p>}
              <p className="check-email">
                {t('Thank you for signing up!')}
              </p>
              <p className="check-email">
                {t("Please open the email we've sent you and confirm our email address to start using VIVIBOOM.")}
              </p>
              <p className="spam-email">
                {t("Don't forget our email may be hiding in your spam folder!")}
              </p>
              <div className="welcome-video">
                <iframe
                  src={`${welcomeVideoLink}?autoplay=1`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
          {showSignaturePad && (
            <div className="signature-pad">
              <div className="backdrop" onClick={() => setShowSignaturePad(null)} />
              <div className="canvas-ctn">
                <ReactSignatureCanvas ref={signatureRef} canvasProps={{ className: 'sig-canvas' }} backgroundColor="#fff" />
                <div className="ok-btn" onClick={onSignatureSubmit}>
                  <Check />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserRegistrationFormEE;
