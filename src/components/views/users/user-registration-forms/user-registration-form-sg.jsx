import React, {
  useState, useEffect, useCallback, useRef,
} from 'react';
import './user-registration-form-sg.scss';

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
import UserPDF from './user-registration-pdf-sg';

const termsLink = 'https://vivita.sg/wp-content/uploads/2021/05/VIVITA-Membership-Terms-PN-20210317.pdf';
const privacyPolicyLink = 'https://vivita.club/privacy/';

const welcomeVideoLink = 'https://www.youtube.com/embed/mSht4hQuypg';

const usernameRegex = '^(?=.{5,18}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$';

function UserRegistrationFormSG({
  authToCreate, userId,
}) {
  const { t } = useTranslation('translation', { keyPrefix: 'userRegistration' });
  const loggedInUser = useSelector((state) => state.user);
  const branch = useSelector((state) => state.branch);

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [isNewForm, setNewForm] = useState(true);
  const [user, setUser] = useState();

  const [userEdit, setUserEdit] = useState({});
  const [agreementChecks, setAgreementChecks] = useState([false, false, false]);

  const [showSignaturePad, setShowSignaturePad] = useState(null);
  const [signatureUrls, setSignatureUrls] = useState({ member: null, guardian: null });

  const isCreateUser = !userId;

  const signatureRef = useRef();

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
    document.getElementById('sign-up-form').scrollIntoView({ behavior: 'smooth' });
    setNewForm(false);
    setPage(2);
  };

  // 3 => 1
  const handleStartNewForm = () => {
    setNewForm(true);
    document.getElementById('sign-up-form').scrollIntoView({ behavior: 'smooth' });
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
        address: '',
        branchId: branch?.id,
        username: '',
        password: '',
      });
      setUser();
      setAgreementChecks([false, false, false]);
      setSignatureUrls({ member: null, guardian: null });
    }
  }, [branch, isNewForm]);

  // 2 => 3
  const onSubmitForm = useCallback(async (evt) => {
    evt.preventDefault();

    if (!agreementChecks.reduce((prev, cur) => prev && cur, true)) {
      toast.error('Please agree with ALL the Terms and Conditions');
      return;
    }
    if (!signatureUrls.member || !signatureUrls.guardian) {
      toast.error('Please provide signatures of both member and guardian');
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
      mediaReleaseConsent: Number(agreementChecks[1]),
    };

    if (userEdit?.email) requestParams.email = userEdit.email;
    if (userEdit?.phone) requestParams.phone = userEdit.phone;

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
      doc.html(document.getElementById('create-user-pdf-sg'), {
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
  }, [agreementChecks, signatureUrls?.member, signatureUrls?.guardian, userEdit, isCreateUser, loggedInUser?.authToken]);

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
      <UserPDF user={userEdit} signatureUrls={signatureUrls} verifiedBy={loggedInUser.name} />
      <div className="sign-up-page-sg">
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
                  {/* <option value="primary 1">Primary 1</option>
                      <option value="primary 2">Primary 2</option> */}
                  <option value="primary 3">Primary 3</option>
                  <option value="primary 4">Primary 4</option>
                  <option value="primary 5">Primary 5</option>
                  <option value="primary 6">Primary 6</option>
                  <option value="secondary 1">Secondary 1</option>
                  <option value="secondary 2">Secondary 2</option>
                  <option value="secondary 3">Secondary 3</option>
                  <option value="secondary 4">Secondary 4</option>
                  <option value="secondary 5">Secondary 5</option>
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

                <h3 className="section-title">
                  Agreement to use VIVISTOP
                </h3>
                <div className="policies">
                  <div className="point">
                    <p>1 Registration</p>
                    <p className="text">Children who would like to access VIVISTOP will need to register as a "VIVINAUT"</p>
                  </div>
                  <div className="point">
                    <p>
                      2 Acceptance of VIVITA Membership Terms (the "
                      <a href={termsLink} target="_blank" rel="noreferrer" className="link">{t('Membership Terms')}</a>
                      ") and Privacy Notice (the "
                      <a href={privacyPolicyLink} target="_blank" rel="noreferrer" className="link">{t('Privacy Policy')}</a>
                      ")
                    </p>
                    <p className="text">
                      {t('Before filling in this registration form, the Crew will share the Membership Terms and Privacy Policy with the Guardian.')}
                    </p>
                  </div>
                  <div className="point">
                    <p>
                      3 Verification of Identity
                    </p>
                    <p className="text">
                      Identification documents will be verified by the Crew for registration purposes. However, VIVITA will not retain any copies of
                      the said identification documents.
                    </p>
                  </div>
                </div>

                <div className="agreements">
                  <p className="subsection-title">By signing this agreement,</p>
                  <p>
                    <input type="checkbox" checked={agreementChecks[0]} onChange={handeAgreementCheckChange(0)} />
                    {' '}
                    {' '}
                    I acknowledge that I have read and agree to the
                    {' '}
                    <a href={termsLink} target="_blank" rel="noreferrer" className="link">Membership Terms</a>
                    {' '}
                    and the
                    {' '}
                    {' '}
                    <a href={privacyPolicyLink} target="_blank" rel="noreferrer" className="link">Privacy Policy</a>
                    {' '}
                    .
                  </p>
                  <p>
                    <input type="checkbox" checked={agreementChecks[1]} onChange={handeAgreementCheckChange(1)} />
                    {' '}
                    {' '}
                    I acknowledge and agree to the photographing and filming of my child/ward during VIVITA activities and the use of the photos
                    and videos to promote VIVITA's activities, including in social media.
                  </p>
                  <p>
                    <input type="checkbox" checked={agreementChecks[2]} onChange={handeAgreementCheckChange(2)} />
                    {' '}
                    {' '}
                    I confirm that the information stated above is true and correct and VIVITA is not liable for any incidents resulting from the
                    provision of false information.
                  </p>
                </div>
              </div>

              <div className="signature-section">
                <p className="subsection-title">{t('YES! I want to be a VIVINAUT!')}</p>
                <div className="signatures">
                  <div className="signature">
                    <div className="sig-title">{t("Member's Signature:")}</div>
                    <div className="sig-img" onClick={handleSignatureClick('member')}>
                      {
                            signatureUrls.member ? <img src={signatureUrls.member} alt="member's signature" /> : t('Click here to sign')
                          }
                    </div>
                  </div>
                  <div className="signature">
                    <div className="sig-title">{t("Guardian's Signature")}</div>
                    <div className="sig-img" onClick={handleSignatureClick('guardian')}>
                      {
                            signatureUrls.guardian ? <img src={signatureUrls.guardian} alt="guardian's signature" /> : t('Click here to sign')
                          }
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

export default UserRegistrationFormSG;
