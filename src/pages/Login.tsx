import UserModernDashboard from "../components/UserModernDashboard";
import { usePageSEO } from "../hooks/usePageSEO";
import {
  AuthCard,
  ResetPasswordForm,
  AccountDeletionModal,
  useAuthPage,
} from "../features/auth";

export default function Login() {
  const {
    incomingParams,
    isSignUp,
    setIsSignUp,
    email,
    setEmail,
    password,
    setPassword,
    fullName,
    setFullName,
    company,
    setCompany,
    showPassword,
    setShowPassword,
    formLoading,
    formError,
    setFormError,
    signUpSuccessMessage,
    setSignUpSuccessMessage,
    sessionDisplacedInfo,
    setSessionDisplacedInfo,
    isDeleteAccountOpen,
    setIsDeleteAccountOpen,
    clientDeleteReason,
    setClientDeleteReason,
    clientDeleteCustomReason,
    setClientDeleteCustomReason,
    clientDeleteComments,
    setClientDeleteComments,
    clientDeleteConfirmation,
    setClientDeleteConfirmation,
    isDeletingClientAccount,
    accountDeletedNotice,
    currentUser,
    userProfile,
    userOrders,
    loading,
    purchasedItems,
    usageHistory,
    userTier,
    downloadsToday,
    downloadsThisMonth,
    remainingFreeToday,
    remainingPremiumThisMonth,
    userSubscription,
    studioWhatsapp,
    isProExpired,
    isProUser,
    proDaysRemaining,
    googleLoading,
    handleGoogleSignIn,
    handleSubmitAuth,
    failedAttempts,
    cooldownRemaining,
    showForgotModal,
    setShowForgotModal,
    resetEmail,
    setResetEmail,
    resetLoading,
    resetFeedback,
    setResetFeedback,
    handleForgotPassword,
    isResetMode,
    setIsResetMode,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showNewPassword,
    setShowNewPassword,
    resetSubmitting,
    resetError,
    resetCompleted,
    handleUpdatePassword,
    handleLogout,
    handleDeleteMyAccount,
  } = useAuthPage();

  usePageSEO({
    title: currentUser ? "Client Portal & Ledger | SlideBee" : "Client & Admin Login | SlideBee",
    description:
      "Access your purchased PowerPoint decks, track custom presentation milestones, manage presentation downloads, or sign in as administrator.",
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center text-[#111111]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#726F6D]">
            Loading SlideBee Account...
          </p>
        </div>
      </div>
    );
  }

  // 1. AUTHENTICATED CLIENT DASHBOARD
  if (currentUser && !isResetMode) {
    return (
      <div className="min-h-screen bg-[#FFF9E8]">
        <UserModernDashboard
          currentUser={currentUser}
          userProfile={userProfile}
          userSubscription={userSubscription}
          userTier={userTier}
          userOrders={userOrders}
          purchasedItems={purchasedItems}
          usageHistory={usageHistory}
          downloadsToday={downloadsToday}
          downloadsThisMonth={downloadsThisMonth}
          remainingFreeToday={remainingFreeToday}
          remainingPremiumThisMonth={remainingPremiumThisMonth}
          proDaysRemaining={proDaysRemaining}
          isProUser={isProUser}
          isProExpired={isProExpired}
          handleLogout={handleLogout}
          studioWhatsapp={studioWhatsapp}
          onDeleteAccount={() => setIsDeleteAccountOpen(true)}
        />

        <AccountDeletionModal
          isOpen={isDeleteAccountOpen}
          onClose={() => setIsDeleteAccountOpen(false)}
          currentUserEmail={currentUser.email}
          clientDeleteReason={clientDeleteReason}
          setClientDeleteReason={setClientDeleteReason}
          clientDeleteCustomReason={clientDeleteCustomReason}
          setClientDeleteCustomReason={setClientDeleteCustomReason}
          clientDeleteComments={clientDeleteComments}
          setClientDeleteComments={setClientDeleteComments}
          clientDeleteConfirmation={clientDeleteConfirmation}
          setClientDeleteConfirmation={setClientDeleteConfirmation}
          isDeleting={isDeletingClientAccount}
          onConfirmDelete={handleDeleteMyAccount}
        />
      </div>
    );
  }

  // 2. UNAUTHENTICATED SIGN IN / SIGN UP / RESET VIEW
  return (
    <div className="min-h-screen bg-[#FFF9E8] flex items-center justify-center p-4 relative overflow-hidden large-hex-grid pt-28 pb-20">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FCBF14]/15 rounded-full blur-[140px] pointer-events-none" />

      {isResetMode ? (
        <div className="hex-card-lg bg-white border-2 border-primary/40 p-8 sm:p-10 shadow-2xl max-w-md w-full relative z-10">
          <ResetPasswordForm
            resetCompleted={resetCompleted}
            resetError={resetError}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showNewPassword={showNewPassword}
            setShowNewPassword={setShowNewPassword}
            resetSubmitting={resetSubmitting}
            onSubmit={handleUpdatePassword}
            onCancel={() => {
              setIsResetMode(false);
              sessionStorage.removeItem("slidebee_password_recovery");
              window.location.hash = "#/login";
            }}
          />
        </div>
      ) : (
        <AuthCard
          isSignUp={isSignUp}
          setIsSignUp={setIsSignUp}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          fullName={fullName}
          setFullName={setFullName}
          company={company}
          setCompany={setCompany}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          formLoading={formLoading}
          formError={formError}
          setFormError={setFormError}
          signUpSuccessMessage={signUpSuccessMessage}
          setSignUpSuccessMessage={setSignUpSuccessMessage}
          accountDeletedNotice={accountDeletedNotice}
          incomingParams={incomingParams}
          sessionDisplacedInfo={sessionDisplacedInfo}
          dismissDisplacedNotice={() => {
            sessionStorage.removeItem("slidebee_session_displaced");
            sessionStorage.removeItem("slidebee_displaced_by");
            setSessionDisplacedInfo({ displaced: false, newDevice: "" });
          }}
          failedAttempts={failedAttempts}
          cooldownRemaining={cooldownRemaining}
          googleLoading={googleLoading}
          handleGoogleSignIn={handleGoogleSignIn}
          handleSubmitAuth={handleSubmitAuth}
          showForgotModal={showForgotModal}
          setShowForgotModal={setShowForgotModal}
          resetEmail={resetEmail}
          setResetEmail={setResetEmail}
          resetLoading={resetLoading}
          resetFeedback={resetFeedback}
          setResetFeedback={setResetFeedback}
          handleForgotPassword={handleForgotPassword}
        />
      )}
    </div>
  );
}
